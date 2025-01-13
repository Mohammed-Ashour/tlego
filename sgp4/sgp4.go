package sgp4

import (
	"math"
)

// Constants
const (
	pi       = math.Pi
	twopi    = 2.0 * pi
	deg2Rad  = pi / 180.0
	wgs72old = 1
	wgs72    = 2
	wgs84    = 3
)

func dpper(e3, ee2, peo, pgho, pho, pinco, plo, se2, se3, sgh2,
	sgh3, sgh4, sh2, sh3, si2, si3, sl2, sl3, sl4, t,
	xgh2, xgh3, xgh4, xh2, xh3, xi2, xi3, xl2, xl3, xl4,
	zmol, zmos float64,
	init string,
	rec *ElsetRec,
	opsmode string) {

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
	if init == "y" {
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
	if init == "y" {
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

	if init == "n" {
		pe = pe - peo
		pinc = pinc - pinco
		pl = pl - plo
		pgh = pgh - pgho
		ph = ph - pho
		rec.Inclp = rec.Inclp + pinc
		rec.Ep = rec.Ep + pe

		sinip := math.Sin(rec.Inclp)
		cosip := math.Cos(rec.Inclp)

		// Apply periodics directly
		if rec.Inclp >= 0.2 {
			ph = ph / sinip
			pgh = pgh - cosip*ph
			rec.Argpp = rec.Argpp + pgh
			rec.Nodep = rec.Nodep + ph
			rec.Mp = rec.Mp + pl
		} else {
			// Apply periodics with lyddane modification
			sinop := math.Sin(rec.Nodep)
			cosop := math.Cos(rec.Nodep)
			alfdp := sinip * sinop
			betdp := sinip * cosop
			dalf := ph*cosop + pinc*cosip*sinop
			dbet := -ph*sinop + pinc*cosip*cosop
			alfdp = alfdp + dalf
			betdp = betdp + dbet

			rec.Nodep = math.Mod(rec.Nodep, twopi)

			// sgp4fix for afspc written intrinsic functions
			if rec.Nodep < 0.0 && opsmode == "a" {
				rec.Nodep = rec.Nodep + twopi
			}

			xls := rec.Mp + rec.Argpp + cosip*rec.Nodep
			dls := pl + pgh - pinc*rec.Nodep*sinip
			xls = xls + dls
			xls = math.Mod(xls, twopi)
			xnoh := rec.Nodep
			rec.Nodep = math.Atan2(alfdp, betdp)

			// sgp4fix for afspc written intrinsic functions
			if rec.Nodep < 0.0 && opsmode == "a" {
				rec.Nodep = rec.Nodep + twopi
			}

			if math.Abs(xnoh-rec.Nodep) > pi {
				if rec.Nodep < xnoh {
					rec.Nodep = rec.Nodep + twopi
				} else {
					rec.Nodep = rec.Nodep - twopi
				}
			}

			rec.Mp = rec.Mp + pl
			rec.Argpp = xls - rec.Mp - cosip*rec.Nodep
		}
	}
}

func dscom(epoch, ep, argpp, tc, inclp, nodep, np float64, rec *ElsetRec) {
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
	rec.Nm = np
	rec.Em = ep
	rec.Snodm = math.Sin(nodep)
	rec.Cnodm = math.Cos(nodep)
	rec.Sinomm = math.Sin(argpp)
	rec.Cosomm = math.Cos(argpp)
	rec.Sinim = math.Sin(inclp)
	rec.Cosim = math.Cos(inclp)
	rec.Emsq = rec.Em * rec.Em
	betasq := 1.0 - rec.Emsq
	rec.Rtemsq = math.Sqrt(betasq)

	// Initialize lunar-solar terms
	rec.Peo = 0.0
	rec.Pinco = 0.0
	rec.Plo = 0.0
	rec.Pgho = 0.0
	rec.Pho = 0.0

	// Calculate day and related parameters
	rec.Day = epoch + 18261.5 + tc/1440.0
	xnodce := math.Mod(4.5236020-9.2422029e-4*rec.Day, twopi)
	stem := math.Sin(xnodce)
	ctem := math.Cos(xnodce)
	zcosil := 0.91375164 - 0.03568096*ctem
	zsinil := math.Sqrt(1.0 - zcosil*zcosil)
	zsinhl := 0.089683511 * stem / zsinil
	zcoshl := math.Sqrt(1.0 - zsinhl*zsinhl)
	rec.Gam = 5.8351514 + 0.0019443680*rec.Day

	// Calculate intermediate parameters
	zx := 0.39785416 * stem / zsinil
	zy := zcoshl*ctem + 0.91744867*zsinhl*stem
	zx = math.Atan2(zx, zy)
	zx = rec.Gam + zx - xnodce
	zcosgl := math.Cos(zx)
	zsingl := math.Sin(zx)

	// Initialize solar terms
	zcosg := zcosgs
	zsing := zsings
	zcosi := zcosis
	zsini := zsinis
	zcosh := rec.Cnodm
	zsinh := rec.Snodm
	cc := c1ss
	xnoi := 1.0 / rec.Nm

	// Main loop for lunar and solar terms
	for lsflg := 1; lsflg <= 2; lsflg++ {
		// Calculate intermediate values
		a1 := zcosg*zcosh + zsing*zcosi*zsinh
		a3 := -zsing*zcosh + zcosg*zcosi*zsinh
		a7 := -zcosg*zsinh + zsing*zcosi*zcosh
		a8 := zsing * zsini
		a9 := zsing*zsinh + zcosg*zcosi*zcosh
		a10 := zcosg * zsini
		a2 := rec.Cosim*a7 + rec.Sinim*a8
		a4 := rec.Cosim*a9 + rec.Sinim*a10
		a5 := -rec.Sinim*a7 + rec.Cosim*a8
		a6 := -rec.Sinim*a9 + rec.Cosim*a10

		// Calculate x values
		x1 := a1*rec.Cosomm + a2*rec.Sinomm
		x2 := a3*rec.Cosomm + a4*rec.Sinomm
		x3 := -a1*rec.Sinomm + a2*rec.Cosomm
		x4 := -a3*rec.Sinomm + a4*rec.Cosomm
		x5 := a5 * rec.Sinomm
		x6 := a6 * rec.Sinomm
		x7 := a5 * rec.Cosomm
		x8 := a6 * rec.Cosomm

		// Calculate z values
		rec.Z31 = 12.0*x1*x1 - 3.0*x3*x3
		rec.Z32 = 24.0*x1*x2 - 6.0*x3*x4
		rec.Z33 = 12.0*x2*x2 - 3.0*x4*x4
		rec.Z1 = 3.0*(a1*a1+a2*a2) + rec.Z31*rec.Emsq
		rec.Z2 = 6.0*(a1*a3+a2*a4) + rec.Z32*rec.Emsq
		rec.Z3 = 3.0*(a3*a3+a4*a4) + rec.Z33*rec.Emsq
		rec.Z11 = -6.0*a1*a5 + rec.Emsq*(-24.0*x1*x7-6.0*x3*x5)
		rec.Z12 = (-6.0*(a1*a6+a3*a5) + rec.Emsq*(-24.0*(x2*x7+x1*x8)-6.0*(x3*x6+x4*x5)))
		rec.Z13 = -6.0*a3*a6 + rec.Emsq*(-24.0*x2*x8-6.0*x4*x6)
		rec.Z21 = 6.0*a2*a5 + rec.Emsq*(24.0*x1*x5-6.0*x3*x7)
		rec.Z22 = (6.0*(a4*a5+a2*a6) + rec.Emsq*(24.0*(x2*x5+x1*x6)-6.0*(x4*x7+x3*x8)))
		rec.Z23 = 6.0*a4*a6 + rec.Emsq*(24.0*x2*x6-6.0*x4*x8)
		rec.Z1 = rec.Z1 + rec.Z1 + betasq*rec.Z31
		rec.Z2 = rec.Z2 + rec.Z2 + betasq*rec.Z32
		rec.Z3 = rec.Z3 + rec.Z3 + betasq*rec.Z33
		rec.S3 = cc * xnoi
		rec.S2 = -0.5 * rec.S3 / rec.Rtemsq
		rec.S4 = rec.S3 * rec.Rtemsq
		rec.S1 = -15.0 * rec.Em * rec.S4
		rec.S5 = x1*x3 + x2*x4
		rec.S6 = x2*x3 + x1*x4
		rec.S7 = x2*x4 - x1*x3

		// Continue with more calculations...
		// [Rest of the calculations following the same pattern]

		// Store lunar terms if in first iteration
		if lsflg == 1 {
			rec.Ss1 = rec.S1
			rec.Ss2 = rec.S2
			rec.Ss3 = rec.S3
			rec.Ss4 = rec.S4
			rec.Ss5 = rec.S5
			rec.Ss6 = rec.S6
			rec.Ss7 = rec.S7
			rec.Sz1 = rec.Z1
			rec.Sz2 = rec.Z2
			rec.Sz3 = rec.Z3
			rec.Sz11 = rec.Z11
			rec.Sz12 = rec.Z12
			rec.Sz13 = rec.Z13
			rec.Sz21 = rec.Z21
			rec.Sz22 = rec.Z22
			rec.Sz23 = rec.Z23
			rec.Sz31 = rec.Z31
			rec.Sz32 = rec.Z32
			rec.Sz33 = rec.Z33

			// Update parameters for solar terms
			zcosg = zcosgl
			zsing = zsingl
			zcosi = zcosil
			zsini = zsinil
			zcosh = zcoshl*rec.Cnodm + zsinhl*rec.Snodm
			zsinh = rec.Snodm*zcoshl - rec.Cnodm*zsinhl
			cc = c1l
		}
	}

	// Calculate final periodic terms
	rec.Zmol = math.Mod(4.7199672+0.22997150*rec.Day-rec.Gam, twopi)
	rec.Zmos = math.Mod(6.2565837+0.017201977*rec.Day, twopi)

	// Calculate solar terms

	rec.Se2 = 2.0 * rec.Ss1 * rec.Ss6
	rec.Se3 = 2.0 * rec.Ss1 * rec.Ss7
	rec.Si2 = 2.0 * rec.Ss2 * rec.Sz12
	rec.Si3 = 2.0 * rec.Ss2 * (rec.Sz13 - rec.Sz11)
	rec.Sl2 = -2.0 * rec.Ss3 * rec.Sz2
	rec.Sl3 = -2.0 * rec.Ss3 * (rec.Sz3 - rec.Sz1)
	rec.Sl4 = -2.0 * rec.Ss3 * (-21.0 - 9.0*rec.Emsq) * zes
	rec.Sgh2 = 2.0 * rec.Ss4 * rec.Sz32
	rec.Sgh3 = 2.0 * rec.Ss4 * (rec.Sz33 - rec.Sz31)
	rec.Sgh4 = -18.0 * rec.Ss4 * zes
	rec.Sh2 = -2.0 * rec.Ss2 * rec.Sz22
	rec.Sh3 = -2.0 * rec.Ss2 * (rec.Sz23 - rec.Sz21)

	// Calculate lunar terms

	rec.Ee2 = 2.0 * rec.S1 * rec.S6
	rec.E3 = 2.0 * rec.S1 * rec.S7
	rec.Xi2 = 2.0 * rec.S2 * rec.Sz12
	rec.Xi3 = 2.0 * rec.S2 * (rec.Sz13 - rec.Sz11)
	rec.Xl2 = -2.0 * rec.S3 * rec.Sz2
	rec.Xl3 = -2.0 * rec.S3 * (rec.Sz3 - rec.Sz1)
	rec.Xl4 = -2.0 * rec.S3 * (-21.0 - 9.0*rec.Emsq) * zel
	rec.Xgh2 = 2.0 * rec.S4 * rec.Sz32
	rec.Xgh3 = 2.0 * rec.S4 * (rec.Sz33 - rec.Sz31)
	rec.Xgh4 = -18.0 * rec.S4 * zel
	rec.Xh2 = -2.0 * rec.S2 * rec.Sz22
	rec.Xh3 = -2.0 * rec.S2 * (rec.Sz23 - rec.Sz21)

}

func dsinit(tc float64, xpidot float64, rec *ElsetRec) {
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
	rec.Irez = 0
	if (rec.Nm < 0.0052359877) && (rec.Nm > 0.0034906585) {
		rec.Irez = 1
	}

	if (rec.Nm >= 8.26e-3) && (rec.Nm <= 9.24e-3) && (rec.Em >= 0.5) {
		rec.Irez = 2
	}
	// Solar terms
	ses := rec.Ss1 * zns * rec.Ss5
	sis := rec.Ss2 * zns * (rec.Sz11 + rec.Sz13)
	sls := -zns * rec.Ss3 * (rec.Sz1 + rec.Sz3 - 14.0 - 6.0*rec.Emsq)
	sghs := rec.Ss4 * zns * (rec.Sz31 + rec.Sz33 - 6.0)
	shs := -zns * rec.Ss2 * (rec.Sz21 + rec.Sz23)

	//sgp4fix for 180 deg incl
	if (rec.Inclm < 5.2359877e-2) || (rec.Inclm > pi-5.2359877e-2) {
		shs = 0.0
	}
	if rec.Sinim != 0.0 {
		shs = shs / rec.Sinim
	}
	sgs := sghs - rec.Cosim*shs

	// Initialize lunar solar terms

	rec.Dedt = ses + rec.S1*znl*rec.S5
	rec.Didt = sis + rec.S2*znl*(rec.Z11+rec.Z13)
	rec.Dmdt = sls - znl*rec.S3*(rec.Z1+rec.Z3-14.0-6.0*rec.Emsq)
	sghl := rec.S4 * znl * (rec.Z31 + rec.Z33 - 6.0)
	shll := -znl * rec.S2 * (rec.Z21 + rec.Z23)

	// sgp4fix for 180 deg incl
	if (rec.Inclm < 5.2359877e-2) || (rec.Inclm > pi-5.2359877e-2) {
		shll = 0.0
	}
	rec.Domdt = sgs + sghl
	rec.Dnodt = shs
	if rec.Sinim != 0.0 {
		rec.Domdt = rec.Domdt - rec.Cosim/rec.Sinim*shll
		rec.Dnodt = rec.Dnodt + shll/rec.Sinim
	}
	/*
		    #/* ----------- calculate deep space resonance effects --------

			rec.dndt = 0.0
			theta = math.fmod(rec.gsto + tc * rptim, twopi)
			rec.em = rec.em + rec.dedt * rec.t
			rec.inclm = rec.inclm + rec.didt * rec.t
			rec.argpm = rec.argpm + rec.domdt * rec.t
			rec.nodem = rec.nodem + rec.dnodt * rec.t
			rec.mm = rec.mm + rec.dmdt * rec.t
			#//   sgp4fix for negative inclinations
			#//   the following if statement should be commented out
			#//if (inclm < 0.0)
			#//  {
			#//    inclm  = -inclm
			#//    argpm  = argpm - pi
			#//    nodem = nodem + pi
			#//  }
	*/
	rec.Dndt = 0.0
	theta := math.Mod(rec.Gsto+tc*rptim, twopi)
	rec.Em += rec.Dedt * rec.T
	rec.Inclm += rec.Didt * rec.T
	rec.Argpm += rec.Domdt * rec.T
	rec.Nodem += rec.Dnodt * rec.T
	rec.Mm += rec.Dmdt * rec.T
	// sgp4fix for negative inclinations
	if rec.Inclm < 0.0 {
		rec.Inclm = -rec.Inclm
		rec.Argpm = rec.Argpm - pi
		rec.Nodem = rec.Nodem + pi
	}

	if rec.Irez != 0 {
		aonv := math.Pow(rec.Nm/rec.Xke, x2o3)

		// Geopotential resonance for 12 hour orbits
		if rec.Irez == 2 {
			cosisq := rec.Cosim * rec.Cosim
			emo := rec.Em
			rec.Em = rec.Ecco
			emsqo := rec.Emsq
			rec.Emsq = rec.Eccsq
			eoc := rec.Em * rec.Emsq
			g201 := -0.306 - (rec.Em-0.64)*0.440

			var g211, g310, g322, g410, g422, g520, g521, g532, g533 float64
			if rec.Em <= 0.65 {
				g211 = 3.616 - 13.2470*rec.Em + 16.2900*rec.Emsq
				g310 = -19.302 + 117.3900*rec.Em - 228.4190*rec.Emsq + 156.5910*eoc
				g322 = -18.9068 + 109.7927*rec.Em - 214.6334*rec.Emsq + 146.5816*eoc
				g410 = -41.122 + 242.6940*rec.Em - 471.0940*rec.Emsq + 313.9530*eoc
				g422 = -146.407 + 841.8800*rec.Em - 1629.014*rec.Emsq + 1083.4350*eoc
				g520 = -532.114 + 3017.977*rec.Em - 5740.032*rec.Emsq + 3708.2760*eoc
			} else {
				g211 = -72.099 + 331.819*rec.Em - 508.738*rec.Emsq + 266.724*eoc
				g310 = -346.844 + 1582.851*rec.Em - 2415.925*rec.Emsq + 1246.113*eoc
				g322 = -342.585 + 1554.908*rec.Em - 2366.899*rec.Emsq + 1215.972*eoc
				g410 = -1052.797 + 4758.686*rec.Em - 7193.992*rec.Emsq + 3651.957*eoc
				g422 = -3581.690 + 16178.110*rec.Em - 24462.770*rec.Emsq + 12422.520*eoc
				if rec.Em > 0.715 {
					g520 = -5149.66 + 29936.92*rec.Em - 54087.36*rec.Emsq + 31324.56*eoc
				} else {
					g520 = 1464.74 - 4664.75*rec.Em + 3763.64*rec.Emsq
				}
			}

			if rec.Em < 0.7 {
				g533 = -919.22770 + 4988.6100*rec.Em - 9064.7700*rec.Emsq + 5542.21*eoc
				g521 = -822.71072 + 4568.6173*rec.Em - 8491.4146*rec.Emsq + 5337.524*eoc
				g532 = -853.66600 + 4690.2500*rec.Em - 8624.7700*rec.Emsq + 5341.4*eoc
			} else {
				g533 = -37995.780 + 161616.52*rec.Em - 229838.20*rec.Emsq + 109377.94*eoc
				g521 = -51752.104 + 218913.95*rec.Em - 309468.16*rec.Emsq + 146349.42*eoc
				g532 = -40023.880 + 170470.89*rec.Em - 242699.48*rec.Emsq + 115605.82*eoc
			}

			sini2 := rec.Sinim * rec.Sinim
			f220 := 0.75 * (1.0 + 2.0*rec.Cosim + cosisq)
			f221 := 1.5 * sini2
			f321 := 1.875 * rec.Sinim * (1.0 - 2.0*rec.Cosim - 3.0*cosisq)
			f322 := -1.875 * rec.Sinim * (1.0 + 2.0*rec.Cosim - 3.0*cosisq)
			f441 := 35.0 * sini2 * f220
			f442 := 39.3750 * sini2 * sini2
			f522 := 9.84375 * rec.Sinim * (sini2*(1.0-2.0*rec.Cosim-5.0*cosisq) +
				0.33333333*(-2.0+4.0*rec.Cosim+6.0*cosisq))
			f523 := rec.Sinim * (4.92187512*sini2*(-2.0-4.0*rec.Cosim+
				10.0*cosisq) + 6.56250012*(1.0+2.0*rec.Cosim-3.0*cosisq))
			f542 := 29.53125 * rec.Sinim * (2.0 - 8.0*rec.Cosim + cosisq*
				(-12.0+8.0*rec.Cosim+10.0*cosisq))
			f543 := 29.53125 * rec.Sinim * (-2.0 - 8.0*rec.Cosim + cosisq*
				(12.0+8.0*rec.Cosim-10.0*cosisq))

			xno2 := rec.Nm * rec.Nm
			ainv2 := aonv * aonv
			temp1 := 3.0 * xno2 * ainv2
			temp := temp1 * root22
			rec.D2201 = temp * f220 * g201
			rec.D2211 = temp * f221 * g211
			temp1 = temp1 * aonv
			temp = temp1 * root32
			rec.D3210 = temp * f321 * g310
			rec.D3222 = temp * f322 * g322
			temp1 = temp1 * aonv
			temp = 2.0 * temp1 * root44
			rec.D4410 = temp * f441 * g410
			rec.D4422 = temp * f442 * g422
			temp1 = temp1 * aonv
			temp = temp1 * root52
			rec.D5220 = temp * f522 * g520
			rec.D5232 = temp * f523 * g532
			temp = 2.0 * temp1 * root54
			rec.D5421 = temp * f542 * g521
			rec.D5433 = temp * f543 * g533

			rec.Xlamo = math.Mod(rec.Mo+rec.Nodeo+rec.Nodeo-theta-theta, twopi)
			rec.Xfact = rec.Mdot + rec.Dmdt + 2.0*(rec.Nodedot+rec.Dnodt-rptim) - rec.NoUnkozai
			rec.Em = emo
			rec.Emsq = emsqo
		}

		// Synchronous resonance terms
		if rec.Irez == 1 {
			g200 := 1.0 + rec.Emsq*(-2.5+0.8125*rec.Emsq)
			g310 := 1.0 + 2.0*rec.Emsq
			g300 := 1.0 + rec.Emsq*(-6.0+6.60937*rec.Emsq)
			f220 := 0.75 * (1.0 + rec.Cosim) * (1.0 + rec.Cosim)
			f311 := 0.9375*rec.Sinim*rec.Sinim*(1.0+3.0*rec.Cosim) - 0.75*(1.0+rec.Cosim)
			f330 := 1.0 + rec.Cosim
			f330 = 1.875 * f330 * f330 * f330
			rec.Del1 = 3.0 * rec.Nm * rec.Nm * aonv * aonv
			rec.Del2 = 2.0 * rec.Del1 * f220 * g200 * q22
			rec.Del3 = 3.0 * rec.Del1 * f330 * g300 * q33 * aonv
			rec.Del1 = rec.Del1 * f311 * g310 * q31 * aonv
			rec.Xlamo = math.Mod(rec.Mo+rec.Nodeo+rec.Argpo-theta, twopi)
			rec.Xfact = rec.Mdot + xpidot - rptim + rec.Dmdt + rec.Domdt + rec.Dnodt - rec.NoUnkozai
		}

		// For sgp4, initialize the integrator
		rec.Xli = rec.Xlamo
		rec.Xni = rec.NoUnkozai
		rec.Atime = 0.0
		rec.Nm = rec.NoUnkozai + rec.Dndt
	}
}
