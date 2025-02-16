package visual

import (
	"fmt"
	"math"
	"os"
	"time"

	"github.com/Mohammed-Ashour/tlego/pkg/locate"
	"github.com/Mohammed-Ashour/tlego/pkg/sgp4"
	"github.com/Mohammed-Ashour/tlego/pkg/tle"
)

// Point represents a satellite position with an associated timestamp.

func DrawOrbit(tle tle.TLE, numPoints int) (filename string, err error) {
	sat := sgp4.NewSatelliteFromTLE(tle)
	epochTime := tle.GetTLETime()

	// Calculate orbital period (in minutes).
	orbitalPeriod := 2 * math.Pi / sat.NoUnkozai

	// Sample points for one complete orbit (uniformly).
	points := make([]Point, 0, numPoints)
	for i := 0; i < numPoints; i++ {
		// Uniformly distribute points across the entire orbital period.
		timeOffset := (float64(i) / float64(numPoints)) * orbitalPeriod

		epoch := epochTime.Add(time.Duration(timeOffset * float64(time.Minute)))
		position, _, err := locate.CalculatePositionECI(sat, epoch)
		if err != nil {
			return "", err
		}

		// Scale position relative to Earth's radius (6371 km),
		// so Earth is drawn as a sphere of radius 1 in Three.js.
		scaleFactor := 1.0 / 6371.0
		points = append(points, Point{
			X:    position[0] * scaleFactor,
			Y:    position[1] * scaleFactor,
			Z:    position[2] * scaleFactor,
			Time: epoch,
		})
	}

	return createHTMLVisual(points, tle.Name), nil
}

func createHTMLVisual(points []Point, satelliteName string) string {
	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <title>Satellite Orbit - %s</title>
    <style>
        body { margin: 0; overflow: hidden; background: #000; }
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            font-family: monospace;
            padding: 10px;
            background: rgba(0,0,0,0.7);
        }
    </style>
</head>
<body>
    <div id="info">
        <h3>%s</h3>
        <p>Orbit Visualization</p>
    </div>
    <script type="module">
        import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
        import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';

        const orbitPoints = %s;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        // Earth group
        const earthGroup = new THREE.Group();
        const textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
            textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg')
        ]).then(([map, normalMap]) => {
            const geometry = new THREE.SphereGeometry(1, 64, 64);
            const material = new THREE.MeshPhongMaterial({
                map: map,
                normalMap: normalMap,
                normalScale: new THREE.Vector2(0.85, 0.85)
            });
            earthGroup.add(new THREE.Mesh(geometry, material));
        });
        scene.add(earthGroup);

        // Enhanced orbit visualization
        const orbitGroup = new THREE.Group();
        const mag_factor = 25;
        // Main orbit path
        const orbitCurve = new THREE.CatmullRomCurve3(
            orbitPoints.map(p => new THREE.Vector3(p.X * mag_factor, p.Y * mag_factor, p.Z * mag_factor))
        );
        
        // Thick orbit line with glow
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
            orbitCurve.getPoints(200)
        );
        
        const orbitMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });
        
        const glowMaterial = new THREE.LineBasicMaterial({
            color: 0xff4444,
            linewidth: 6,
            transparent: true,
            opacity: 0.3
        });
        
        orbitGroup.add(new THREE.Line(orbitGeometry, orbitMaterial));
        orbitGroup.add(new THREE.Line(orbitGeometry, glowMaterial));
		// Orbit markers
        const markerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        orbitPoints.forEach((point, i) => {
            if (i %% 20 === 0) {
                const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                marker.position.set(point.X * mag_factor, point.Y * mag_factor, point.Z * mag_factor);
                orbitGroup.add(marker);
            }
        });
        
        scene.add(orbitGroup);

        // Satellite with enhanced visibility
        const satellite = new THREE.Group();
        const satelliteBody = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 16, 16),
            new THREE.MeshPhongMaterial({ 
                color: 0xf54500,
                emissive: 0xff4400,
                emissiveIntensity: 0.8
            })
        );
        const satelliteGlow = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 16, 16),
            new THREE.MeshBasicMaterial({
                color: 0x0066ff,
                transparent: true,
                opacity: 0.3
            })
        );
        satellite.add(satelliteBody);
        satellite.add(satelliteGlow);
        scene.add(satellite);

        // Enhanced lighting
        scene.add(new THREE.AmbientLight(0x404040));
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(10, 10, 10);
        scene.add(sunLight);

        // Camera and controls setup
        camera.position.set(3, 3, 3);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 1.5;
        controls.maxDistance = 10;
		// Animation
        let time = 0;
        const timeStep = 0.001;
        const totalPoints = orbitPoints.length;
		
        function animate() {
            requestAnimationFrame(animate);
            earthGroup.rotation.y += 0.001;
            
            time = (time + timeStep) %% totalPoints;
            const index = Math.floor(time);
            const nextIndex = (index + 1) %% totalPoints;
            
            const currentPoint = orbitPoints[index];
            const nextPoint = orbitPoints[nextIndex];
            const fraction = time - Math.floor(time);
            
            satellite.position.set(
                (currentPoint.X + (nextPoint.X - currentPoint.X) * fraction) * mag_factor,
                (currentPoint.Y + (nextPoint.Y - currentPoint.Y) * fraction) * mag_factor,
                (currentPoint.Z + (nextPoint.Z - currentPoint.Z) * fraction) * mag_factor
            );
            
            controls.update();
            renderer.render(scene, camera);
        }

        animate();

        // Handle window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth/window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    </script>
</body>
</html>
    `,
		satelliteName,
		satelliteName,
		pointsToJSArray(points),
	)

	htmlFileName := satelliteName + ".html"
	if err := os.WriteFile(htmlFileName, []byte(html), 0644); err != nil {
		fmt.Println("Error writing HTML file:", err)
	}
	return htmlFileName
}

// pointsToJSArray formats the orbit points into a valid JavaScript array literal.
func pointsToJSArray(points []Point) string {
	js := "["
	for i, p := range points {
		if i > 0 {
			js += ","
		}
		js += fmt.Sprintf(`{X:%.6f,Y:%.6f,Z:%.6f}`, p.X, p.Y, p.Z)
	}
	js += "]"
	return js
}
