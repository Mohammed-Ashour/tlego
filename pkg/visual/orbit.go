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

// SatelliteData represents a single satellite's data
type SatelliteData struct {
	Name   string
	Points []Point
	Color  string // Hex color code
}

func CreateOrbitPoints(tle tle.TLE, numPoints int) ([]Point, error) {
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
			return nil, err
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
	return points, nil
}

// Modified CreateHTMLVisual to accept multiple satellites
func CreateHTMLVisual(satellites []SatelliteData) string {
	// Convert satellites data to JS array
	satellitesJS := "["
	for i, sat := range satellites {
		if i > 0 {
			satellitesJS += ","
		}
		satellitesJS += fmt.Sprintf(`{
            name: %q,
            color: %q,
            points: %s
        }`, sat.Name, sat.Color, pointsToJSArray(sat.Points))
	}
	satellitesJS += "]"

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <title>Multiple Satellite Orbits</title>
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
        <h3>Multiple Satellite Visualization</h3>
        <div id="satelliteList"></div>
    </div>
    <script type="module">
        import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
        import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';

        const satellites = %s;
        const satelliteObjects = [];
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        // Earth setup
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

        // Create orbit visualizations for each satellite
        satellites.forEach(sat => {
            const orbitGroup = new THREE.Group();
            const mag_factor = 25;

            // Create orbit path using BufferGeometry
            const vertices = [];
            sat.points.forEach(p => {
                vertices.push(
                    p.X * mag_factor, 
                    p.Y * mag_factor, 
                    p.Z * mag_factor
                );
            });
            // Add the first point again to close the loop
            if (sat.points.length > 0) {
                vertices.push(
                    sat.points[0].X * mag_factor,
                    sat.points[0].Y * mag_factor,
                    sat.points[0].Z * mag_factor
                );
            }
            
            const orbitGeometry = new THREE.BufferGeometry();
            orbitGeometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(vertices, 3)
            );
            
            const color = new THREE.Color(sat.color);
            const orbitMaterial = new THREE.LineBasicMaterial({
                color: color,
                linewidth: 3,
                transparent: true,
                opacity: 0.8
            });
            
            const glowMaterial = new THREE.LineBasicMaterial({
                color: color,
                linewidth: 6,
                transparent: true,
                opacity: 0.3
            });
            
            orbitGroup.add(new THREE.Line(orbitGeometry, orbitMaterial));
            orbitGroup.add(new THREE.Line(orbitGeometry, glowMaterial));

            // Create satellite
            const satellite = new THREE.Group();
            const satelliteBody = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 16, 16),
                new THREE.MeshPhongMaterial({ 
                    color: color,
                    emissive: color,
                    emissiveIntensity: 0.8
                })
            );
            const satelliteGlow = new THREE.Mesh(
                new THREE.SphereGeometry(0.07, 16, 16),
                new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 0.3
                })
            );
            satellite.add(satelliteBody);
            satellite.add(satelliteGlow);
            
            scene.add(orbitGroup);
            scene.add(satellite);
            
            // Store satellite object for animation
            satelliteObjects.push({
                satellite,
                points: sat.points,
                name: sat.name,
                color: sat.color,
                time: Math.random() * sat.points.length
            });

            // Add to info panel
            if (sat.name && sat.name.trim() !== '') {
            const satInfo = document.createElement('p');
            satInfo.style.margin = '5px 0';
            satInfo.innerHTML = '<span style="color:' + sat.color + '">■</span> ' + sat.name;
            document.getElementById('satelliteList').appendChild(satInfo);
            }       
        });

        // Lighting and camera setup (same as before)
        scene.add(new THREE.AmbientLight(0x404040));
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.set(10, 10, 10);
        scene.add(sunLight);

        camera.position.set(3, 3, 3);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 1.5;
        controls.maxDistance = 10;

        // Animation
        const timeStep = 0.001;
        const mag_factor = 25;
        
        function animate() {
            requestAnimationFrame(animate);
            earthGroup.rotation.y += 0.001;
            
            // Update each satellite position
            satelliteObjects.forEach(obj => {
                // Check if points array exists and is not empty
                if (!obj.points || obj.points.length === 0) {
                    console.warn('No points data for satellite ${obj.name}');
                    return;
                }

                obj.time = (obj.time + timeStep) %% obj.points.length;
                const index = Math.floor(obj.time);
                const nextIndex = (index + 1) %% obj.points.length;
                
                const currentPoint = obj.points[index];
                const nextPoint = obj.points[nextIndex];

                // Validate points before using them
                if (!currentPoint || !nextPoint) {
                    console.warn('Invalid points data for satellite ${obj.name} at index ${index}');
                    return;
                }

                const fraction = obj.time - Math.floor(obj.time);
                
                obj.satellite.position.set(
                    (currentPoint.X + (nextPoint.X - currentPoint.X) * fraction) * mag_factor,
                    (currentPoint.Y + (nextPoint.Y - currentPoint.Y) * fraction) * mag_factor,
                    (currentPoint.Z + (nextPoint.Z - currentPoint.Z) * fraction) * mag_factor
                );
            });
            
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
</html>`, satellitesJS)

	htmlFileName := "multiple_satellites.html"
	if err := os.WriteFile(htmlFileName, []byte(html), 0644); err != nil {
		fmt.Println("Error writing HTML file:", err)
	}
	return htmlFileName
}

// pointsToJSArray formats the orbit points into a valid JavaScript array literal.
func pointsToJSArray(points []Point) string {
	if len(points) == 0 {
		return "[]"
	}

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
