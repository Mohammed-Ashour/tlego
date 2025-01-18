package sgp4

import (
	"math"
)

// Constants
const (
	pi       = math.Pi
	twopi    = 2.0 * pi
	deg2Rad  = pi / 180.0
	Xpdotp   = 1440.0 / (2.0 * pi) // 229.1831180523293
	Wgs72old = 1
	Wgs72    = 2
	Wgs84    = 3
)

func dpper(e3, ee2, peo, pgho, pho, pinco, plo, se2, se3, sgh2,
	sgh3, sgh4, sh2, sh3, si2, si3, sl2, sl3, sl4, t,
	xgh2, xgh3, xgh4, xh2, xh3, xi2, xi3, xl2, xl3, xl4,
	zmol, zmos float64,
	init rune,
	sat *Satellite,
	opsmode rune) {

	// Constants
	const (
		zns = 1.19459e-5
		zes = 0.01675
		znl = 1.5835218e-4
		zel = 0.05490
	)

	// Calculate time varying periodics
	zm := zmos + zns*t
	// Be sure that the initial call has time set to zero
	if init == 'y' {
		zm = zmos
	}

	zf := zm + 2.0*zes*math.Sin(zm)
	sinzf := math.Sin(zf)
	f2 := 0.5*sinzf*sinzf - 0.25
	f3 := -0.5 * sinzf * math.Cos(zf)

	ses := se2*f2 + se3*f3
	sis := si2*f2 + si3*f3
	sls := sl2*f2 + sl3*f3 + sl4*sinzf
	sghs := sgh2*f2 + sgh3*f3 + sgh4*sinzf
	shs := sh2*f2 + sh3*f3

	zm = zmol + znl*t
	if init == 'y' {
		zm = zmol
	}

	zf = zm + 2.0*zel*math.Sin(zm)
	sinzf = math.Sin(zf)
	f2 = 0.5*sinzf*sinzf - 0.25
	f3 = -0.5 * sinzf * math.Cos(zf)

	sel := ee2*f2 + e3*f3
	sil := xi2*f2 + xi3*f3
	sll := xl2*f2 + xl3*f3 + xl4*sinzf
	sghl := xgh2*f2 + xgh3*f3 + xgh4*sinzf
	shll := xh2*f2 + xh3*f3

	pe := ses + sel
	pinc := sis + sil
	pl := sls + sll
	pgh := sghs + sghl
	ph := shs + shll

	if init == 'n' {
		pe = pe - peo
		pinc = pinc - pinco
		pl = pl - plo
		pgh = pgh - pgho
		ph = ph - pho
		sat.Inclp = sat.Inclp + pinc
		sat.Ep = sat.Ep + pe

		sinip := math.Sin(sat.Inclp)
		cosip := math.Cos(sat.Inclp)

		// Apply periodics directly
		if sat.Inclp >= 0.2 {
			ph = ph / sinip
			pgh = pgh - cosip*ph
			sat.Argpp = sat.Argpp + pgh
			sat.Nodep = sat.Nodep + ph
			sat.Mp = sat.Mp + pl
		} else {
			// Apply periodics with lyddane modification
			sinop := math.Sin(sat.Nodep)
			cosop := math.Cos(sat.Nodep)
			alfdp := sinip * sinop
			betdp := sinip * cosop
			dalf := ph*cosop + pinc*cosip*sinop
			dbet := -ph*sinop + pinc*cosip*cosop
			alfdp = alfdp + dalf
			betdp = betdp + dbet

			sat.Nodep = math.Mod(sat.Nodep, twopi)

			// sgp4fix for afspc written intrinsic functions
			if sat.Nodep < 0.0 && opsmode == 'a' {
				sat.Nodep = sat.Nodep + twopi
			}

			xls := sat.Mp + sat.Argpp + cosip*sat.Nodep
			dls := pl + pgh - pinc*sat.Nodep*sinip
			xls = xls + dls
			xls = math.Mod(xls, twopi)
			xnoh := sat.Nodep
			sat.Nodep = math.Atan2(alfdp, betdp)

			// sgp4fix for afspc written intrinsic functions
			if sat.Nodep < 0.0 && opsmode == 'a' {
				sat.Nodep = sat.Nodep + twopi
			}

			if math.Abs(xnoh-sat.Nodep) > pi {
				if sat.Nodep < xnoh {
					sat.Nodep = sat.Nodep + twopi
				} else {
					sat.Nodep = sat.Nodep - twopi
				}
			}

			sat.Mp = sat.Mp + pl
			sat.Argpp = xls - sat.Mp - cosip*sat.Nodep
		}
	}
}

func dscom(epoch, ep, argpp, tc, inclp, nodep, np float64, sat *Satellite) {
	// Constants for lunar-solar terms
	const (
		zes    = 0.01675
		zel    = 0.05490
		c1ss   = 2.9864797e-6
		c1l    = 4.7968065e-7
		zsinis = 0.39785416
		zcosis = 0.91744867
		zcosgs = 0.1945905
		zsings = -0.98088458
	)

	// Initialize satellite parameters
	sat.Nm = np
	sat.Em = ep
	sat.Snodm = math.Sin(nodep)
	sat.Cnodm = math.Cos(nodep)
	sat.Sinomm = math.Sin(argpp)
	sat.Cosomm = math.Cos(argpp)
	sat.Sinim = math.Sin(inclp)
	sat.Cosim = math.Cos(inclp)
	sat.Emsq = sat.Em * sat.Em
	betasq := 1.0 - sat.Emsq
	sat.Rtemsq = math.Sqrt(betasq)

	// Initialize lunar-solar terms
	sat.Peo = 0.0
	sat.Pinco = 0.0
	sat.Plo = 0.0
	sat.Pgho = 0.0
	sat.Pho = 0.0

	// Calculate day and related parameters
	sat.Day = epoch + 18261.5 + tc/1440.0
	xnodce := math.Mod(4.5236020-9.2422029e-4*sat.Day, twopi)
	stem := math.Sin(xnodce)
	ctem := math.Cos(xnodce)
	zcosil := 0.91375164 - 0.03568096*ctem
	zsinil := math.Sqrt(1.0 - zcosil*zcosil)
	zsinhl := 0.089683511 * stem / zsinil
	zcoshl := math.Sqrt(1.0 - zsinhl*zsinhl)
	sat.Gam = 5.8351514 + 0.0019443680*sat.Day

	// Calculate intermediate parameters
	zx := 0.39785416 * stem / zsinil
	zy := zcoshl*ctem + 0.91744867*zsinhl*stem
	zx = math.Atan2(zx, zy)
	zx = sat.Gam + zx - xnodce
	zcosgl := math.Cos(zx)
	zsingl := math.Sin(zx)

	// Initialize solar terms
	zcosg := zcosgs
	zsing := zsings
	zcosi := zcosis
	zsini := zsinis
	zcosh := sat.Cnodm
	zsinh := sat.Snodm
	cc := c1ss
	xnoi := 1.0 / sat.Nm

	// Main loop for lunar and solar terms
	for lsflg := 1; lsflg <= 2; lsflg++ {
		// Calculate intermediate values
		a1 := zcosg*zcosh + zsing*zcosi*zsinh
		a3 := -zsing*zcosh + zcosg*zcosi*zsinh
		a7 := -zcosg*zsinh + zsing*zcosi*zcosh
		a8 := zsing * zsini
		a9 := zsing*zsinh + zcosg*zcosi*zcosh
		a10 := zcosg * zsini
		a2 := sat.Cosim*a7 + sat.Sinim*a8
		a4 := sat.Cosim*a9 + sat.Sinim*a10
		a5 := -sat.Sinim*a7 + sat.Cosim*a8
		a6 := -sat.Sinim*a9 + sat.Cosim*a10

		// Calculate x values
		x1 := a1*sat.Cosomm + a2*sat.Sinomm
		x2 := a3*sat.Cosomm + a4*sat.Sinomm
		x3 := -a1*sat.Sinomm + a2*sat.Cosomm
		x4 := -a3*sat.Sinomm + a4*sat.Cosomm
		x5 := a5 * sat.Sinomm
		x6 := a6 * sat.Sinomm
		x7 := a5 * sat.Cosomm
		x8 := a6 * sat.Cosomm

		// Calculate z values
		sat.Z31 = 12.0*x1*x1 - 3.0*x3*x3
		sat.Z32 = 24.0*x1*x2 - 6.0*x3*x4
		sat.Z33 = 12.0*x2*x2 - 3.0*x4*x4
		sat.Z1 = 3.0*(a1*a1+a2*a2) + sat.Z31*sat.Emsq
		sat.Z2 = 6.0*(a1*a3+a2*a4) + sat.Z32*sat.Emsq
		sat.Z3 = 3.0*(a3*a3+a4*a4) + sat.Z33*sat.Emsq
		sat.Z11 = -6.0*a1*a5 + sat.Emsq*(-24.0*x1*x7-6.0*x3*x5)
		sat.Z12 = (-6.0*(a1*a6+a3*a5) + sat.Emsq*(-24.0*(x2*x7+x1*x8)-6.0*(x3*x6+x4*x5)))
		sat.Z13 = -6.0*a3*a6 + sat.Emsq*(-24.0*x2*x8-6.0*x4*x6)
		sat.Z21 = 6.0*a2*a5 + sat.Emsq*(24.0*x1*x5-6.0*x3*x7)
		sat.Z22 = (6.0*(a4*a5+a2*a6) + sat.Emsq*(24.0*(x2*x5+x1*x6)-6.0*(x4*x7+x3*x8)))
		sat.Z23 = 6.0*a4*a6 + sat.Emsq*(24.0*x2*x6-6.0*x4*x8)
		sat.Z1 = sat.Z1 + sat.Z1 + betasq*sat.Z31
		sat.Z2 = sat.Z2 + sat.Z2 + betasq*sat.Z32
		sat.Z3 = sat.Z3 + sat.Z3 + betasq*sat.Z33
		sat.S3 = cc * xnoi
		sat.S2 = -0.5 * sat.S3 / sat.Rtemsq
		sat.S4 = sat.S3 * sat.Rtemsq
		sat.S1 = -15.0 * sat.Em * sat.S4
		sat.S5 = x1*x3 + x2*x4
		sat.S6 = x2*x3 + x1*x4
		sat.S7 = x2*x4 - x1*x3

		// Continue with more calculations...
		// [Rest of the calculations following the same pattern]

		// Store lunar terms if in first iteration
		if lsflg == 1 {
			sat.Ss1 = sat.S1
			sat.Ss2 = sat.S2
			sat.Ss3 = sat.S3
			sat.Ss4 = sat.S4
			sat.Ss5 = sat.S5
			sat.Ss6 = sat.S6
			sat.Ss7 = sat.S7
			sat.Sz1 = sat.Z1
			sat.Sz2 = sat.Z2
			sat.Sz3 = sat.Z3
			sat.Sz11 = sat.Z11
			sat.Sz12 = sat.Z12
			sat.Sz13 = sat.Z13
			sat.Sz21 = sat.Z21
			sat.Sz22 = sat.Z22
			sat.Sz23 = sat.Z23
			sat.Sz31 = sat.Z31
			sat.Sz32 = sat.Z32
			sat.Sz33 = sat.Z33

			// Update parameters for solar terms
			zcosg = zcosgl
			zsing = zsingl
			zcosi = zcosil
			zsini = zsinil
			zcosh = zcoshl*sat.Cnodm + zsinhl*sat.Snodm
			zsinh = sat.Snodm*zcoshl - sat.Cnodm*zsinhl
			cc = c1l
		}
	}

	// Calculate final periodic terms
	sat.Zmol = math.Mod(4.7199672+0.22997150*sat.Day-sat.Gam, twopi)
	sat.Zmos = math.Mod(6.2565837+0.017201977*sat.Day, twopi)

	// Calculate solar terms

	sat.Se2 = 2.0 * sat.Ss1 * sat.Ss6
	sat.Se3 = 2.0 * sat.Ss1 * sat.Ss7
	sat.Si2 = 2.0 * sat.Ss2 * sat.Sz12
	sat.Si3 = 2.0 * sat.Ss2 * (sat.Sz13 - sat.Sz11)
	sat.Sl2 = -2.0 * sat.Ss3 * sat.Sz2
	sat.Sl3 = -2.0 * sat.Ss3 * (sat.Sz3 - sat.Sz1)
	sat.Sl4 = -2.0 * sat.Ss3 * (-21.0 - 9.0*sat.Emsq) * zes
	sat.Sgh2 = 2.0 * sat.Ss4 * sat.Sz32
	sat.Sgh3 = 2.0 * sat.Ss4 * (sat.Sz33 - sat.Sz31)
	sat.Sgh4 = -18.0 * sat.Ss4 * zes
	sat.Sh2 = -2.0 * sat.Ss2 * sat.Sz22
	sat.Sh3 = -2.0 * sat.Ss2 * (sat.Sz23 - sat.Sz21)

	// Calculate lunar terms

	sat.Ee2 = 2.0 * sat.S1 * sat.S6
	sat.E3 = 2.0 * sat.S1 * sat.S7
	sat.Xi2 = 2.0 * sat.S2 * sat.Sz12
	sat.Xi3 = 2.0 * sat.S2 * (sat.Sz13 - sat.Sz11)
	sat.Xl2 = -2.0 * sat.S3 * sat.Sz2
	sat.Xl3 = -2.0 * sat.S3 * (sat.Sz3 - sat.Sz1)
	sat.Xl4 = -2.0 * sat.S3 * (-21.0 - 9.0*sat.Emsq) * zel
	sat.Xgh2 = 2.0 * sat.S4 * sat.Sz32
	sat.Xgh3 = 2.0 * sat.S4 * (sat.Sz33 - sat.Sz31)
	sat.Xgh4 = -18.0 * sat.S4 * zel
	sat.Xh2 = -2.0 * sat.S2 * sat.Sz22
	sat.Xh3 = -2.0 * sat.S2 * (sat.Sz23 - sat.Sz21)

}

func dsinit(tc float64, xpidot float64, sat *Satellite) {
	// Constants
	const (
		q22    = 1.7891679e-6
		q31    = 2.1460748e-6
		q33    = 2.2123015e-7
		root22 = 1.7891679e-6
		root44 = 7.3636953e-9
		root54 = 2.1765803e-9
		rptim  = 4.37526908801129966e-3 // this equates to 7.29211514668855e-5 rad/sec
		root32 = 3.7393792e-7
		root52 = 1.1428639e-7
		x2o3   = 2.0 / 3.0
		znl    = 1.5835218e-4
		zns    = 1.19459e-5
	)
	// deep space initialization
	sat.Irez = 0
	if (sat.Nm < 0.0052359877) && (sat.Nm > 0.0034906585) {
		sat.Irez = 1
	}

	if (sat.Nm >= 8.26e-3) && (sat.Nm <= 9.24e-3) && (sat.Em >= 0.5) {
		sat.Irez = 2
	}
	// Solar terms
	ses := sat.Ss1 * zns * sat.Ss5
	sis := sat.Ss2 * zns * (sat.Sz11 + sat.Sz13)
	sls := -zns * sat.Ss3 * (sat.Sz1 + sat.Sz3 - 14.0 - 6.0*sat.Emsq)
	sghs := sat.Ss4 * zns * (sat.Sz31 + sat.Sz33 - 6.0)
	shs := -zns * sat.Ss2 * (sat.Sz21 + sat.Sz23)

	//sgp4fix for 180 deg incl
	if (sat.Inclm < 5.2359877e-2) || (sat.Inclm > pi-5.2359877e-2) {
		shs = 0.0
	}
	if sat.Sinim != 0.0 {
		shs = shs / sat.Sinim
	}
	sgs := sghs - sat.Cosim*shs

	// Initialize lunar solar terms

	sat.Dedt = ses + sat.S1*znl*sat.S5
	sat.Didt = sis + sat.S2*znl*(sat.Z11+sat.Z13)
	sat.Dmdt = sls - znl*sat.S3*(sat.Z1+sat.Z3-14.0-6.0*sat.Emsq)
	sghl := sat.S4 * znl * (sat.Z31 + sat.Z33 - 6.0)
	shll := -znl * sat.S2 * (sat.Z21 + sat.Z23)

	// sgp4fix for 180 deg incl
	if (sat.Inclm < 5.2359877e-2) || (sat.Inclm > pi-5.2359877e-2) {
		shll = 0.0
	}
	sat.Domdt = sgs + sghl
	sat.Dnodt = shs
	if sat.Sinim != 0.0 {
		sat.Domdt = sat.Domdt - sat.Cosim/sat.Sinim*shll
		sat.Dnodt = sat.Dnodt + shll/sat.Sinim
	}

	sat.Dndt = 0.0
	theta := math.Mod(sat.Gsto+tc*rptim, twopi)
	sat.Em += sat.Dedt * sat.T
	sat.Inclm += sat.Didt * sat.T
	sat.Argpm += sat.Domdt * sat.T
	sat.Nodem += sat.Dnodt * sat.T
	sat.Mm += sat.Dmdt * sat.T
	// sgp4fix for negative inclinations
	if sat.Inclm < 0.0 {
		sat.Inclm = -sat.Inclm
		sat.Argpm = sat.Argpm - pi
		sat.Nodem = sat.Nodem + pi
	}

	if sat.Irez != 0 {
		aonv := math.Pow(sat.Nm/sat.Xke, x2o3)

		// Geopotential resonance for 12 hour orbits
		if sat.Irez == 2 {
			cosisq := sat.Cosim * sat.Cosim
			emo := sat.Em
			sat.Em = sat.Ecco
			emsqo := sat.Emsq
			sat.Emsq = sat.Eccsq
			eoc := sat.Em * sat.Emsq
			g201 := -0.306 - (sat.Em-0.64)*0.440

			var g211, g310, g322, g410, g422, g520, g521, g532, g533 float64
			if sat.Em <= 0.65 {
				g211 = 3.616 - 13.2470*sat.Em + 16.2900*sat.Emsq
				g310 = -19.302 + 117.3900*sat.Em - 228.4190*sat.Emsq + 156.5910*eoc
				g322 = -18.9068 + 109.7927*sat.Em - 214.6334*sat.Emsq + 146.5816*eoc
				g410 = -41.122 + 242.6940*sat.Em - 471.0940*sat.Emsq + 313.9530*eoc
				g422 = -146.407 + 841.8800*sat.Em - 1629.014*sat.Emsq + 1083.4350*eoc
				g520 = -532.114 + 3017.977*sat.Em - 5740.032*sat.Emsq + 3708.2760*eoc
			} else {
				g211 = -72.099 + 331.819*sat.Em - 508.738*sat.Emsq + 266.724*eoc
				g310 = -346.844 + 1582.851*sat.Em - 2415.925*sat.Emsq + 1246.113*eoc
				g322 = -342.585 + 1554.908*sat.Em - 2366.899*sat.Emsq + 1215.972*eoc
				g410 = -1052.797 + 4758.686*sat.Em - 7193.992*sat.Emsq + 3651.957*eoc
				g422 = -3581.690 + 16178.110*sat.Em - 24462.770*sat.Emsq + 12422.520*eoc
				if sat.Em > 0.715 {
					g520 = -5149.66 + 29936.92*sat.Em - 54087.36*sat.Emsq + 31324.56*eoc
				} else {
					g520 = 1464.74 - 4664.75*sat.Em + 3763.64*sat.Emsq
				}
			}

			if sat.Em < 0.7 {
				g533 = -919.22770 + 4988.6100*sat.Em - 9064.7700*sat.Emsq + 5542.21*eoc
				g521 = -822.71072 + 4568.6173*sat.Em - 8491.4146*sat.Emsq + 5337.524*eoc
				g532 = -853.66600 + 4690.2500*sat.Em - 8624.7700*sat.Emsq + 5341.4*eoc
			} else {
				g533 = -37995.780 + 161616.52*sat.Em - 229838.20*sat.Emsq + 109377.94*eoc
				g521 = -51752.104 + 218913.95*sat.Em - 309468.16*sat.Emsq + 146349.42*eoc
				g532 = -40023.880 + 170470.89*sat.Em - 242699.48*sat.Emsq + 115605.82*eoc
			}

			sini2 := sat.Sinim * sat.Sinim
			f220 := 0.75 * (1.0 + 2.0*sat.Cosim + cosisq)
			f221 := 1.5 * sini2
			f321 := 1.875 * sat.Sinim * (1.0 - 2.0*sat.Cosim - 3.0*cosisq)
			f322 := -1.875 * sat.Sinim * (1.0 + 2.0*sat.Cosim - 3.0*cosisq)
			f441 := 35.0 * sini2 * f220
			f442 := 39.3750 * sini2 * sini2
			f522 := 9.84375 * sat.Sinim * (sini2*(1.0-2.0*sat.Cosim-5.0*cosisq) +
				0.33333333*(-2.0+4.0*sat.Cosim+6.0*cosisq))
			f523 := sat.Sinim * (4.92187512*sini2*(-2.0-4.0*sat.Cosim+
				10.0*cosisq) + 6.56250012*(1.0+2.0*sat.Cosim-3.0*cosisq))
			f542 := 29.53125 * sat.Sinim * (2.0 - 8.0*sat.Cosim + cosisq*
				(-12.0+8.0*sat.Cosim+10.0*cosisq))
			f543 := 29.53125 * sat.Sinim * (-2.0 - 8.0*sat.Cosim + cosisq*
				(12.0+8.0*sat.Cosim-10.0*cosisq))

			xno2 := sat.Nm * sat.Nm
			ainv2 := aonv * aonv
			temp1 := 3.0 * xno2 * ainv2
			temp := temp1 * root22
			sat.D2201 = temp * f220 * g201
			sat.D2211 = temp * f221 * g211
			temp1 = temp1 * aonv
			temp = temp1 * root32
			sat.D3210 = temp * f321 * g310
			sat.D3222 = temp * f322 * g322
			temp1 = temp1 * aonv
			temp = 2.0 * temp1 * root44
			sat.D4410 = temp * f441 * g410
			sat.D4422 = temp * f442 * g422
			temp1 = temp1 * aonv
			temp = temp1 * root52
			sat.D5220 = temp * f522 * g520
			sat.D5232 = temp * f523 * g532
			temp = 2.0 * temp1 * root54
			sat.D5421 = temp * f542 * g521
			sat.D5433 = temp * f543 * g533

			sat.Xlamo = math.Mod(sat.Mo+sat.Nodeo+sat.Nodeo-theta-theta, twopi)
			sat.Xfact = sat.Mdot + sat.Dmdt + 2.0*(sat.Nodedot+sat.Dnodt-rptim) - sat.NoUnkozai
			sat.Em = emo
			sat.Emsq = emsqo
		}

		// Synchronous resonance terms
		if sat.Irez == 1 {
			g200 := 1.0 + sat.Emsq*(-2.5+0.8125*sat.Emsq)
			g310 := 1.0 + 2.0*sat.Emsq
			g300 := 1.0 + sat.Emsq*(-6.0+6.60937*sat.Emsq)
			f220 := 0.75 * (1.0 + sat.Cosim) * (1.0 + sat.Cosim)
			f311 := 0.9375*sat.Sinim*sat.Sinim*(1.0+3.0*sat.Cosim) - 0.75*(1.0+sat.Cosim)
			f330 := 1.0 + sat.Cosim
			f330 = 1.875 * f330 * f330 * f330
			sat.Del1 = 3.0 * sat.Nm * sat.Nm * aonv * aonv
			sat.Del2 = 2.0 * sat.Del1 * f220 * g200 * q22
			sat.Del3 = 3.0 * sat.Del1 * f330 * g300 * q33 * aonv
			sat.Del1 = sat.Del1 * f311 * g310 * q31 * aonv
			sat.Xlamo = math.Mod(sat.Mo+sat.Nodeo+sat.Argpo-theta, twopi)
			sat.Xfact = sat.Mdot + xpidot - rptim + sat.Dmdt + sat.Domdt + sat.Dnodt - sat.NoUnkozai
		}

		// For sgp4, initialize the integrator
		sat.Xli = sat.Xlamo
		sat.Xni = sat.NoUnkozai
		sat.Atime = 0.0
		sat.Nm = sat.NoUnkozai + sat.Dndt
	}
}

func dspace(tc float64, sat *Satellite) {
	// Constants
	const (
		fasx2 = 0.13130908
		fasx4 = 2.8843198
		fasx6 = 0.37448087
		g22   = 5.7686396
		g32   = 0.95240898
		g44   = 1.8014998
		g52   = 1.0508330
		g54   = 4.4108898
		rptim = 4.37526908801129966e-3
		stepp = 720.0
		stepn = -720.0
		step2 = 259200.0
	)

	var (
		xndt  float64 = 0.0
		xnddt float64 = 0.0
		xldot float64 = 0.0
		ft    float64 = 0.0
	)

	// Calculate deep space resonance effects
	sat.Dndt = 0.0
	theta := math.Mod(sat.Gsto+tc*rptim, twopi)
	sat.Em = sat.Em + sat.Dedt*sat.T

	sat.Inclm = sat.Inclm + sat.Didt*sat.T
	sat.Argpm = sat.Argpm + sat.Domdt*sat.T
	sat.Nodem = sat.Nodem + sat.Dnodt*sat.T
	sat.Mm = sat.Mm + sat.Dmdt*sat.T

	if sat.Irez != 0 {
		if sat.Atime == 0.0 || sat.T*sat.Atime <= 0.0 || math.Abs(sat.T) < math.Abs(sat.Atime) {
			sat.Atime = 0.0
			sat.Xni = sat.NoUnkozai
			sat.Xli = sat.Xlamo
		}

		var delt float64
		if sat.T > 0.0 {
			delt = stepp
		} else {
			delt = stepn
		}

		iretn := 381
		for iretn == 381 {
			if sat.Irez != 2 {
				// Near-synchronous resonance terms
				xndt = sat.Del1*math.Sin(sat.Xli-fasx2) +
					sat.Del2*math.Sin(2.0*(sat.Xli-fasx4)) +
					sat.Del3*math.Sin(3.0*(sat.Xli-fasx6))
				xldot = sat.Xni + sat.Xfact
				xnddt = sat.Del1*math.Cos(sat.Xli-fasx2) +
					2.0*sat.Del2*math.Cos(2.0*(sat.Xli-fasx4)) +
					3.0*sat.Del3*math.Cos(3.0*(sat.Xli-fasx6))
				xnddt *= xldot
			} else {
				// Near-half-day resonance terms
				xomi := sat.Argpo + sat.Argpdot*sat.Atime
				x2omi := xomi + xomi
				x2li := sat.Xli + sat.Xli

				xndt = sat.D2201*math.Sin(x2omi+sat.Xli-g22) +
					sat.D2211*math.Sin(sat.Xli-g22) +
					sat.D3210*math.Sin(xomi+sat.Xli-g32) +
					sat.D3222*math.Sin(-xomi+sat.Xli-g32) +
					sat.D4410*math.Sin(x2omi+x2li-g44) +
					sat.D4422*math.Sin(x2li-g44) +
					sat.D5220*math.Sin(xomi+sat.Xli-g52) +
					sat.D5232*math.Sin(-xomi+sat.Xli-g52) +
					sat.D5421*math.Sin(xomi+x2li-g54) +
					sat.D5433*math.Sin(-xomi+x2li-g54)

				xldot = sat.Xni + sat.Xfact
				xnddt = sat.D2201*math.Cos(x2omi+sat.Xli-g22) +
					sat.D2211*math.Cos(sat.Xli-g22) +
					sat.D3210*math.Cos(xomi+sat.Xli-g32) +
					sat.D3222*math.Cos(-xomi+sat.Xli-g32) +
					sat.D5220*math.Cos(xomi+sat.Xli-g52) +
					sat.D5232*math.Cos(-xomi+sat.Xli-g52) +
					2.0*(sat.D4410*math.Cos(x2omi+x2li-g44)+
						sat.D4422*math.Cos(x2li-g44)+
						sat.D5421*math.Cos(xomi+x2li-g54)+
						sat.D5433*math.Cos(-xomi+x2li-g54))
				xnddt *= xldot
			}

			if math.Abs(sat.T-sat.Atime) >= stepp {
				iretn = 381
			} else {
				ft = sat.T - sat.Atime
				iretn = 0
			}

			if iretn == 381 {
				sat.Xli = sat.Xli + xldot*delt + xndt*step2
				sat.Xni = sat.Xni + xndt*delt + xnddt*step2
				sat.Atime = sat.Atime + delt
			}
		}

		sat.Nm = sat.Xni + xndt*ft + xnddt*ft*ft*0.5
		xl := sat.Xli + xldot*ft + xndt*ft*ft*0.5

		if sat.Irez != 1 {
			sat.Mm = xl - 2.0*sat.Nodem + 2.0*theta
			sat.Dndt = sat.Nm - sat.NoUnkozai
		} else {
			sat.Mm = xl - sat.Nodem - sat.Argpm + theta
			sat.Dndt = sat.Nm - sat.NoUnkozai
		}
		sat.Nm = sat.NoUnkozai + sat.Dndt
	}
}

func gstime(jdut1 float64) float64 {
	tut1 := (jdut1 - 2451545.0) / 36525.0

	temp := (-6.2e-6*tut1*tut1*tut1 +
		0.093104*tut1*tut1 +
		(876600.0*3600+8640184.812866)*tut1 +
		67310.54841) // sec

	temp = math.Mod(temp*deg2Rad/240.0, twopi) // 360/86400 = 1/240, to deg, to rad

	// Check quadrants
	if temp < 0.0 {
		temp += twopi
	}

	return temp
}

func initl(epoch float64, sat *Satellite) {
	// Local constants
	const (
		x2o3   = 2.0 / 3.0
		c1     = 1.72027916940703639e-2
		thgr70 = 1.7321343856509374
		fk5r   = 5.07551419432269442e-15
	)

	// Calculate auxiliary epoch quantities
	sat.Eccsq = sat.Ecco * sat.Ecco
	sat.Omeosq = 1.0 - sat.Eccsq
	sat.Rteosq = math.Sqrt(sat.Omeosq)
	sat.Cosio = math.Cos(sat.Inclo)
	sat.Cosio2 = sat.Cosio * sat.Cosio

	// Un-kozai the mean motion
	ak := math.Pow(sat.Xke/sat.NoKozai, x2o3)
	d1 := 0.75 * sat.J2 * (3.0*sat.Cosio2 - 1.0) / (sat.Rteosq * sat.Omeosq)
	ddel := d1 / (ak * ak)
	adel := ak * (1.0 - ddel*ddel - ddel*(1.0/3.0+134.0*ddel*ddel/81.0))
	ddel = d1 / (adel * adel)
	sat.NoUnkozai = sat.NoKozai / (1.0 + ddel)

	sat.Ao = math.Pow(sat.Xke/sat.NoUnkozai, x2o3)
	sat.Sinio = math.Sin(sat.Inclo)
	po := sat.Ao * sat.Omeosq
	sat.Con42 = 1.0 - 5.0*sat.Cosio2
	sat.Con41 = -sat.Con42 - sat.Cosio2 - sat.Cosio2
	sat.Ainv = 1.0 / sat.Ao
	sat.Posq = po * po
	sat.Rp = sat.Ao * (1.0 - sat.Ecco)
	sat.Method = 'n'

	// Modern approach to finding sidereal time
	ts70 := epoch - 7305.0
	ds70 := math.Floor(ts70 + 1.0e-8)
	tfrac := ts70 - ds70

	// Find Greenwich location at epoch
	c1p2p := c1 + twopi
	gsto1 := math.Mod(thgr70+c1*ds70+c1p2p*tfrac+ts70*ts70*fk5r, twopi)
	if gsto1 < 0.0 {
		gsto1 = gsto1 + twopi
	}

	sat.Gsto = gstime(epoch + 2433281.5)
}

func SetGravConst(whichconst int, sat *Satellite) {
	sat.WhichConst = whichconst

	switch whichconst {
	case Wgs72old:
		// WGS-72 low precision str#3 constants
		sat.Mu = 398600.79964        // in km3 / s2
		sat.RadiusEarthKm = 6378.135 // km
		sat.Xke = 0.0743669161       // reciprocal of tumin
		sat.Tumin = 1.0 / sat.Xke
		sat.J2 = 0.001082616
		sat.J3 = -0.00000253881
		sat.J4 = -0.00000165597
		sat.J3oj2 = sat.J3 / sat.J2

	case Wgs72:
		// WGS-72 constants
		sat.Mu = 398600.8            // in km3 / s2
		sat.RadiusEarthKm = 6378.135 // km
		sat.Xke = 60.0 / math.Sqrt(sat.RadiusEarthKm*sat.RadiusEarthKm*sat.RadiusEarthKm/sat.Mu)
		sat.Tumin = 1.0 / sat.Xke
		sat.J2 = 0.001082616
		sat.J3 = -0.00000253881
		sat.J4 = -0.00000165597
		sat.J3oj2 = sat.J3 / sat.J2

	default: // wgs84
		// WGS-84 constants
		sat.Mu = 398600.5            // in km3 / s2
		sat.RadiusEarthKm = 6378.137 // km
		sat.Xke = 60.0 / math.Sqrt(sat.RadiusEarthKm*sat.RadiusEarthKm*sat.RadiusEarthKm/sat.Mu)
		sat.Tumin = 1.0 / sat.Xke
		sat.J2 = 0.00108262998905
		sat.J3 = -0.00000253215306
		sat.J4 = -0.00000161098761
		sat.J3oj2 = sat.J3 / sat.J2
	}
}

func sgp4init(opsmode rune, sat *Satellite) bool {
	// Local variables
	const temp4 = 1.5e-12

	epoch := (sat.JdsatEpoch + sat.JdsatEpochF) - 2433281.5

	// Initialize all near-Earth variables to zero
	sat.Isimp = 0
	sat.Method = 'n'
	sat.Aycof = 0.0
	sat.Con41 = 0.0
	sat.Cc1 = 0.0
	sat.Cc4 = 0.0
	sat.Cc5 = 0.0
	sat.D2 = 0.0
	sat.D3 = 0.0
	sat.D4 = 0.0
	sat.Delmo = 0.0
	sat.Eta = 0.0
	sat.Argpdot = 0.0
	sat.Omgcof = 0.0
	sat.Sinmao = 0.0
	sat.T = 0.0
	sat.T2cof = 0.0
	sat.T3cof = 0.0
	sat.T4cof = 0.0
	sat.T5cof = 0.0
	sat.X1mth2 = 0.0
	sat.X7thm1 = 0.0
	sat.Mdot = 0.0
	sat.Nodedot = 0.0
	sat.Xlcof = 0.0
	sat.Xmcof = 0.0
	sat.Nodecf = 0.0

	// Initialize all deep-space variables to zero
	sat.Irez = 0
	sat.D2201 = 0.0
	sat.D2211 = 0.0
	sat.D3210 = 0.0
	sat.D3222 = 0.0
	sat.D4410 = 0.0
	sat.D4422 = 0.0
	sat.D5220 = 0.0
	sat.D5232 = 0.0
	sat.D5421 = 0.0
	sat.D5433 = 0.0
	sat.Dedt = 0.0
	sat.Del1 = 0.0
	sat.Del2 = 0.0
	sat.Del3 = 0.0
	sat.Didt = 0.0
	sat.Dmdt = 0.0
	sat.Dnodt = 0.0
	sat.Domdt = 0.0
	sat.E3 = 0.0
	sat.Ee2 = 0.0
	sat.Peo = 0.0
	sat.Pgho = 0.0
	sat.Pho = 0.0
	sat.Pinco = 0.0
	sat.Plo = 0.0
	sat.Se2 = 0.0
	sat.Se3 = 0.0
	sat.Sgh2 = 0.0
	sat.Sgh3 = 0.0
	sat.Sgh4 = 0.0
	sat.Sh2 = 0.0
	sat.Sh3 = 0.0
	sat.Si2 = 0.0
	sat.Si3 = 0.0
	sat.Sl2 = 0.0
	sat.Sl3 = 0.0
	sat.Sl4 = 0.0
	sat.Gsto = 0.0
	sat.Xfact = 0.0
	sat.Xgh2 = 0.0
	sat.Xgh3 = 0.0
	sat.Xgh4 = 0.0
	sat.Xh2 = 0.0
	sat.Xh3 = 0.0
	sat.Xi2 = 0.0
	sat.Xi3 = 0.0
	sat.Xl2 = 0.0
	sat.Xl3 = 0.0
	sat.Xl4 = 0.0
	sat.Xlamo = 0.0
	sat.Zmol = 0.0
	sat.Zmos = 0.0
	sat.Atime = 0.0
	sat.Xli = 0.0
	sat.Xni = 0.0

	// Get gravitational constants
	SetGravConst(sat.WhichConst, sat)

	sat.Error = 0
	sat.OperationMode = opsmode

	// Single averaged mean elements
	sat.Am = 0.0
	sat.Em = 0.0
	sat.Im = 0.0
	sat.Om = 0.0
	sat.Mm = 0.0
	sat.Nm = 0.0

	// Earth constants
	ss := 78.0/sat.RadiusEarthKm + 1.0
	qzms2ttemp := (120.0 - 78.0) / sat.RadiusEarthKm
	qzms2t := qzms2ttemp * qzms2ttemp * qzms2ttemp * qzms2ttemp
	x2o3 := 2.0 / 3.0

	sat.Init = 'y'
	sat.T = 0.0

	// Initialize orbital elements
	initl(epoch, sat)

	sat.A = math.Pow(sat.NoUnkozai*sat.Tumin, -2.0/3.0)
	sat.Alta = sat.A*(1.0+sat.Ecco) - 1.0
	sat.Altp = sat.A*(1.0-sat.Ecco) - 1.0
	sat.Error = 0
	if sat.Omeosq >= 0.0 || sat.NoUnkozai >= 0.0 {
		sat.Isimp = 0
		if sat.Rp < (220.0/sat.RadiusEarthKm + 1.0) {
			sat.Isimp = 1
		}

		sfour := ss
		qzms24 := qzms2t
		perige := (sat.Rp - 1.0) * sat.RadiusEarthKm

		// For perigees below 156 km, s and qoms2t are altered
		if perige < 156.0 {
			sfour = perige - 78.0
			if perige < 98.0 {
				sfour = 20.0
			}
			qzms24temp := (120.0 - sfour) / sat.RadiusEarthKm
			qzms24 = qzms24temp * qzms24temp * qzms24temp * qzms24temp
			sfour = sfour/sat.RadiusEarthKm + 1.0
		}

		pinvsq := 1.0 / sat.Posq
		tsi := 1.0 / (sat.Ao - sfour)
		sat.Eta = sat.Ao * sat.Ecco * tsi
		etasq := sat.Eta * sat.Eta
		eeta := sat.Ecco * sat.Eta
		psisq := math.Abs(1.0 - etasq)
		coef := qzms24 * math.Pow(tsi, 4.0)
		coef1 := coef / math.Pow(psisq, 3.5)

		cc2 := coef1 * sat.NoUnkozai * (sat.Ao*(1.0+1.5*etasq+eeta*
			(4.0+etasq)) + 0.375*sat.J2*tsi/psisq*sat.Con41*
			(8.0+3.0*etasq*(8.0+etasq)))

		sat.Cc1 = sat.Bstar * cc2
		cc3 := 0.0
		if sat.Ecco > 1.0e-4 {
			cc3 = -2.0 * coef * tsi * sat.J3oj2 * sat.NoUnkozai * sat.Sinio / sat.Ecco
		}

		sat.X1mth2 = 1.0 - sat.Cosio2
		sat.Cc4 = 2.0 * sat.NoUnkozai * coef1 * sat.Ao * sat.Omeosq *
			(sat.Eta*(2.0+0.5*etasq) + sat.Ecco*(0.5+2.0*etasq) -
				sat.J2*tsi/(sat.Ao*psisq)*(-3.0*sat.Con41*(1.0-2.0*eeta+etasq*
					(1.5-0.5*eeta))+0.75*sat.X1mth2*(2.0*etasq-eeta*(1.0+etasq))*
					math.Cos(2.0*sat.Argpo)))

		sat.Cc5 = 2.0 * coef1 * sat.Ao * sat.Omeosq * (1.0 + 2.75*(etasq+eeta) + eeta*etasq)

		cosio4 := sat.Cosio2 * sat.Cosio2
		temp1 := 1.5 * sat.J2 * pinvsq * sat.NoUnkozai
		temp2 := 0.5 * temp1 * sat.J2 * pinvsq
		temp3 := -0.46875 * sat.J4 * pinvsq * pinvsq * sat.NoUnkozai

		sat.Mdot = sat.NoUnkozai + 0.5*temp1*sat.Rteosq*sat.Con41 + 0.0625*
			temp2*sat.Rteosq*(13.0-78.0*sat.Cosio2+137.0*cosio4)

		sat.Argpdot = -0.5*temp1*sat.Con42 + 0.0625*temp2*
			(7.0-114.0*sat.Cosio2+395.0*cosio4) +
			temp3*(3.0-36.0*sat.Cosio2+49.0*cosio4)

		xhdot1 := -temp1 * sat.Cosio
		sat.Nodedot = xhdot1 + (0.5*temp2*(4.0-19.0*sat.Cosio2)+
			2.0*temp3*(3.0-7.0*sat.Cosio2))*sat.Cosio

		xpidot := sat.Argpdot + sat.Nodedot
		sat.Omgcof = sat.Bstar * cc3 * math.Cos(sat.Argpo)
		sat.Xmcof = 0.0

		if sat.Ecco > 1.0e-4 {
			sat.Xmcof = -x2o3 * coef * sat.Bstar / eeta
		}

		sat.Nodecf = 3.5 * sat.Omeosq * xhdot1 * sat.Cc1
		sat.T2cof = 1.5 * sat.Cc1

		// sgp4fix for divide by zero with xinco = 180 deg
		if math.Abs(sat.Cosio+1.0) > 1.5e-12 {
			sat.Xlcof = -0.25 * sat.J3oj2 * sat.Sinio * (3.0 + 5.0*sat.Cosio) / (1.0 + sat.Cosio)
		} else {
			sat.Xlcof = -0.25 * sat.J3oj2 * sat.Sinio * (3.0 + 5.0*sat.Cosio) / temp4
		}

		sat.Aycof = -0.5 * sat.J3oj2 * sat.Sinio

		delmotemp := 1.0 + sat.Eta*math.Cos(sat.Mo)
		sat.Delmo = delmotemp * delmotemp * delmotemp
		sat.Sinmao = math.Sin(sat.Mo)
		sat.X7thm1 = 7.0*sat.Cosio2 - 1.0

		// Deep space initialization
		if (2 * pi / sat.NoUnkozai) >= 225.0 {
			sat.Method = 'd'
			sat.Isimp = 1
			tc := 0.0
			sat.Inclm = sat.Inclo

			dscom(epoch, sat.Ecco, sat.Argpo, tc, sat.Inclo, sat.Nodeo, sat.NoUnkozai, sat)

			sat.Ep = sat.Ecco
			sat.Inclp = sat.Inclo
			sat.Nodep = sat.Nodeo
			sat.Argpp = sat.Argpo
			sat.Mp = sat.Mo

			dpper(sat.E3, sat.Ee2, sat.Peo, sat.Pgho,
				sat.Pho, sat.Pinco, sat.Plo, sat.Se2,
				sat.Se3, sat.Sgh2, sat.Sgh3, sat.Sgh4,
				sat.Sh2, sat.Sh3, sat.Si2, sat.Si3,
				sat.Sl2, sat.Sl3, sat.Sl4, sat.T,
				sat.Xgh2, sat.Xgh3, sat.Xgh4, sat.Xh2,
				sat.Xh3, sat.Xi2, sat.Xi3, sat.Xl2,
				sat.Xl3, sat.Xl4, sat.Zmol, sat.Zmos,
				sat.Init, sat, sat.OperationMode)

			sat.Ecco = sat.Ep
			sat.Inclo = sat.Inclp
			sat.Nodeo = sat.Nodep
			sat.Argpo = sat.Argpp
			sat.Mo = sat.Mp

			sat.Argpm = 0.0
			sat.Nodem = 0.0
			sat.Mm = 0.0

			dsinit(tc, xpidot, sat)
		}

		// Set variables if not deep space
		if sat.Isimp != 1 {
			cc1sq := sat.Cc1 * sat.Cc1
			sat.D2 = 4.0 * sat.Ao * tsi * cc1sq
			temp := sat.D2 * tsi * sat.Cc1 / 3.0
			sat.D3 = (17.0*sat.Ao + sfour) * temp
			sat.D4 = 0.5 * temp * sat.Ao * tsi * (221.0*sat.Ao + 31.0*sfour) * sat.Cc1
			sat.T3cof = sat.D2 + 2.0*cc1sq
			sat.T4cof = 0.25 * (3.0*sat.D3 + sat.Cc1*(12.0*sat.D2+10.0*cc1sq))
			sat.T5cof = 0.2 * (3.0*sat.D4 +
				12.0*sat.Cc1*sat.D3 +
				6.0*sat.D2*sat.D2 +
				15.0*cc1sq*(2.0*sat.D2+cc1sq))
		}
	}

	r := [3]float64{0, 0, 0}
	v := [3]float64{0, 0, 0}

	Sgp4(sat, 0.0, &r, &v)

	sat.Init = 'n'

	return true

}

func Sgp4(sat *Satellite, tsince float64, r, v *[3]float64) bool {
	const (
		twopi = 2.0 * math.Pi
		temp4 = 1.5e-12
		x2o3  = 2.0 / 3.0
	)

	vkmpersec := sat.RadiusEarthKm * sat.Xke / 60.0

	// Clear SGP4 error flag
	sat.T = tsince
	sat.Error = 0

	// Update for secular gravity and atmospheric drag
	xmdf := sat.Mo + sat.Mdot*sat.T
	argpdf := sat.Argpo + sat.Argpdot*sat.T
	nodedf := sat.Nodeo + sat.Nodedot*sat.T
	sat.Argpm = argpdf
	sat.Mm = xmdf
	t2 := sat.T * sat.T
	sat.Nodem = nodedf + sat.Nodecf*t2
	tempa := 1.0 - sat.Cc1*sat.T
	tempe := sat.Bstar * sat.Cc4 * sat.T
	templ := sat.T2cof * t2

	delomg := 0.0
	delmtemp := 0.0
	delm := 0.0
	temp := 0.0
	t3 := 0.0
	t4 := 0.0
	mrt := 0.0

	if sat.Isimp != 1 {
		delomg = sat.Omgcof * sat.T
		delmtemp = 1.0 + sat.Eta*math.Cos(xmdf)
		delm = sat.Xmcof * (delmtemp*delmtemp*delmtemp - sat.Delmo)
		temp = delomg + delm
		sat.Mm = xmdf + temp
		sat.Argpm = argpdf - temp
		t3 = t2 * sat.T
		t4 = t3 * sat.T
		tempa = tempa - sat.D2*t2 - sat.D3*t3 - sat.D4*t4
		tempe = tempe + sat.Bstar*sat.Cc5*(math.Sin(sat.Mm)-sat.Sinmao)
		templ = templ + sat.T3cof*t3 + t4*(sat.T4cof+sat.T*sat.T5cof)
	}

	tc := 0.0
	sat.Nm = sat.NoUnkozai
	sat.Em = sat.Ecco
	sat.Inclm = sat.Inclo

	if sat.Method == 'd' {
		tc = sat.T
		dspace(tc, sat)
	}

	if sat.Nm <= 0.0 {
		sat.Error = 2
		return false
	}

	sat.Am = math.Pow((sat.Xke/sat.Nm), x2o3) * tempa * tempa
	sat.Nm = sat.Xke / math.Pow(sat.Am, 1.5)
	sat.Em = sat.Em - tempe

	if sat.Em >= 1.0 || sat.Em < -0.001 {
		sat.Error = 1
		return false
	}

	if sat.Em < 1.0e-6 {
		sat.Em = 1.0e-6
	}

	sat.Mm = sat.Mm + sat.NoUnkozai*templ
	xlm := sat.Mm + sat.Argpm + sat.Nodem
	sat.Emsq = sat.Em * sat.Em
	temp = 1.0 - sat.Emsq

	sat.Nodem = math.Mod(sat.Nodem, twopi)
	sat.Argpm = math.Mod(sat.Argpm, twopi)
	xlm = math.Mod(xlm, twopi)
	sat.Mm = math.Mod(xlm-sat.Argpm-sat.Nodem, twopi)

	// Compute extra mean quantities
	sat.Sinim = math.Sin(sat.Inclm)
	sat.Cosim = math.Cos(sat.Inclm)

	// Add lunar-solar periodics
	sat.Ep = sat.Em
	xincp := sat.Inclm
	sat.Inclp = sat.Inclm
	sat.Argpp = sat.Argpm
	sat.Nodep = sat.Nodem
	sat.Mp = sat.Mm
	sinip := sat.Sinim
	cosip := sat.Cosim

	if sat.Method == 'd' {
		dpper(sat.E3, sat.Ee2, sat.Peo, sat.Pgho,
			sat.Pho, sat.Pinco, sat.Plo, sat.Se2,
			sat.Se3, sat.Sgh2, sat.Sgh3, sat.Sgh4,
			sat.Sh2, sat.Sh3, sat.Si2, sat.Si3,
			sat.Sl2, sat.Sl3, sat.Sl4, sat.T,
			sat.Xgh2, sat.Xgh3, sat.Xgh4, sat.Xh2,
			sat.Xh3, sat.Xi2, sat.Xi3, sat.Xl2,
			sat.Xl3, sat.Xl4, sat.Zmol, sat.Zmos,
			'n', sat, sat.OperationMode)
		xincp = sat.Inclp
		if xincp < 0.0 {
			xincp = -xincp
			sat.Nodep += math.Pi
			sat.Argpp -= math.Pi
		}
		if sat.Ep < 0.0 || sat.Ep > 1.0 {
			sat.Error = 3
			return false
		}
	}

	// Long period periodics
	if sat.Method == 'd' {
		sinip = math.Sin(xincp)
		cosip = math.Cos(xincp)
		sat.Aycof = -0.5 * sat.J3oj2 * sinip

		if math.Abs(cosip+1.0) > 1.5e-12 {
			sat.Xlcof = -0.25 * sat.J3oj2 * sinip * (3.0 + 5.0*cosip) / (1.0 + cosip)
		} else {
			sat.Xlcof = -0.25 * sat.J3oj2 * sinip * (3.0 + 5.0*cosip) / temp4
		}
	}

	axnl := sat.Ep * math.Cos(sat.Argpp)
	temp = 1.0 / (sat.Am * (1.0 - sat.Ep*sat.Ep))
	aynl := sat.Ep*math.Sin(sat.Argpp) + temp*sat.Aycof
	xl := sat.Mp + sat.Argpp + sat.Nodep + temp*sat.Xlcof*axnl

	// Solve Kepler's equation
	u := math.Mod(xl-sat.Nodep, twopi)
	eo1 := u
	tem5 := 9999.9
	ktr := 1

	var sineo1, coseo1 float64

	for math.Abs(tem5) >= 1.0e-12 && ktr <= 10 {
		sineo1 = math.Sin(eo1)
		coseo1 = math.Cos(eo1)
		tem5 = 1.0 - coseo1*axnl - sineo1*aynl
		tem5 = (u - aynl*coseo1 + axnl*sineo1 - eo1) / tem5
		if math.Abs(tem5) >= 0.95 {
			if tem5 > 0.0 {
				tem5 = 0.95
			} else {
				tem5 = -0.95
			}
		}
		eo1 += tem5
		ktr++
	}

	// Short period preliminary quantities
	ecose := axnl*coseo1 + aynl*sineo1
	esine := axnl*sineo1 - aynl*coseo1
	el2 := axnl*axnl + aynl*aynl
	pl := sat.Am * (1.0 - el2)

	if pl < 0.0 {
		sat.Error = 4
		return false
	}

	rl := sat.Am * (1.0 - ecose)
	rdotl := math.Sqrt(sat.Am) * esine / rl
	rvdotl := math.Sqrt(pl) / rl
	betal := math.Sqrt(1.0 - el2)
	temp = esine / (1.0 + betal)
	sinu := sat.Am / rl * (sineo1 - aynl - axnl*temp)
	cosu := sat.Am / rl * (coseo1 - axnl + aynl*temp)
	su := math.Atan2(sinu, cosu)

	sin2u := (cosu + cosu) * sinu
	cos2u := 1.0 - 2.0*sinu*sinu
	temp = 1.0 / pl
	temp1 := 0.5 * sat.J2 * temp
	temp2 := temp1 * temp

	// Update for short period periodics
	if sat.Method == 'd' {
		cosisq := cosip * cosip
		sat.Con41 = 3.0*cosisq - 1.0
		sat.X1mth2 = 1.0 - cosisq
		sat.X7thm1 = 7.0*cosisq - 1.0
	}

	mrt = rl*(1.0-1.5*temp2*betal*sat.Con41) + 0.5*temp1*sat.X1mth2*cos2u
	su -= 0.25 * temp2 * sat.X7thm1 * sin2u
	xnode := sat.Nodep + 1.5*temp2*cosip*sin2u
	xinc := xincp + 1.5*temp2*cosip*sinip*cos2u
	mvt := rdotl - sat.Nm*temp1*sat.X1mth2*sin2u/sat.Xke
	rvdot := rvdotl + sat.Nm*temp1*(sat.X1mth2*cos2u+1.5*sat.Con41)/sat.Xke

	// Orientation vectors
	sinsu := math.Sin(su)
	cossu := math.Cos(su)
	snod := math.Sin(xnode)
	cnod := math.Cos(xnode)
	sini := math.Sin(xinc)
	cosi := math.Cos(xinc)
	xmx := -snod * cosi
	xmy := cnod * cosi
	ux := xmx*sinsu + cnod*cossu
	uy := xmy*sinsu + snod*cossu
	uz := sini * sinsu
	vx := xmx*cossu - cnod*sinsu
	vy := xmy*cossu - snod*sinsu
	vz := sini * cossu

	// Position and velocity
	r[0] = (mrt * ux) * sat.RadiusEarthKm
	r[1] = (mrt * uy) * sat.RadiusEarthKm
	r[2] = (mrt * uz) * sat.RadiusEarthKm
	v[0] = (mvt*ux + rvdot*vx) * vkmpersec
	v[1] = (mvt*uy + rvdot*vy) * vkmpersec
	v[2] = (mvt*uz + rvdot*vz) * vkmpersec

	// Sgp4fix for decaying satellites
	if mrt < 1.0 {
		sat.Error = 6
		return false
	}

	return true
}

func Jday(year, mon, day, hr, minute int, sec float64) (float64, float64) {
	var jd, jdFrac float64

	jd = (367.0*float64(year) -
		math.Floor((7*(float64(year)+math.Floor(float64(mon+9)/12.0)))*0.25) +
		math.Floor(275*float64(mon)/9.0) +
		float64(day) + 1721013.5) // use - 678987.0 to go to mjd directly

	jdFrac = (sec + float64(minute)*60.0 + float64(hr)*3600.0) / 86400.0

	// Check that the day and fractional day are correct
	if math.Abs(jdFrac) > 1.0 {
		dtt := math.Floor(jdFrac)
		jd = jd + dtt
		jdFrac = jdFrac - dtt
	}

	return jd, jdFrac
}
