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

func dspace(tc float64, rec *ElsetRec) {
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
	rec.Dndt = 0.0
	theta := math.Mod(rec.Gsto+tc*rptim, twopi)
	rec.Em = rec.Em + rec.Dedt*rec.T

	rec.Inclm = rec.Inclm + rec.Didt*rec.T
	rec.Argpm = rec.Argpm + rec.Domdt*rec.T
	rec.Nodem = rec.Nodem + rec.Dnodt*rec.T
	rec.Mm = rec.Mm + rec.Dmdt*rec.T

	if rec.Irez != 0 {
		if rec.Atime == 0.0 || rec.T*rec.Atime <= 0.0 || math.Abs(rec.T) < math.Abs(rec.Atime) {
			rec.Atime = 0.0
			rec.Xni = rec.NoUnkozai
			rec.Xli = rec.Xlamo
		}

		var delt float64
		if rec.T > 0.0 {
			delt = stepp
		} else {
			delt = stepn
		}

		iretn := 381
		for iretn == 381 {
			if rec.Irez != 2 {
				// Near-synchronous resonance terms
				xndt = rec.Del1*math.Sin(rec.Xli-fasx2) +
					rec.Del2*math.Sin(2.0*(rec.Xli-fasx4)) +
					rec.Del3*math.Sin(3.0*(rec.Xli-fasx6))
				xldot = rec.Xni + rec.Xfact
				xnddt = rec.Del1*math.Cos(rec.Xli-fasx2) +
					2.0*rec.Del2*math.Cos(2.0*(rec.Xli-fasx4)) +
					3.0*rec.Del3*math.Cos(3.0*(rec.Xli-fasx6))
				xnddt *= xldot
			} else {
				// Near-half-day resonance terms
				xomi := rec.Argpo + rec.Argpdot*rec.Atime
				x2omi := xomi + xomi
				x2li := rec.Xli + rec.Xli

				xndt = rec.D2201*math.Sin(x2omi+rec.Xli-g22) +
					rec.D2211*math.Sin(rec.Xli-g22) +
					rec.D3210*math.Sin(xomi+rec.Xli-g32) +
					rec.D3222*math.Sin(-xomi+rec.Xli-g32) +
					rec.D4410*math.Sin(x2omi+x2li-g44) +
					rec.D4422*math.Sin(x2li-g44) +
					rec.D5220*math.Sin(xomi+rec.Xli-g52) +
					rec.D5232*math.Sin(-xomi+rec.Xli-g52) +
					rec.D5421*math.Sin(xomi+x2li-g54) +
					rec.D5433*math.Sin(-xomi+x2li-g54)

				xldot = rec.Xni + rec.Xfact
				xnddt = rec.D2201*math.Cos(x2omi+rec.Xli-g22) +
					rec.D2211*math.Cos(rec.Xli-g22) +
					rec.D3210*math.Cos(xomi+rec.Xli-g32) +
					rec.D3222*math.Cos(-xomi+rec.Xli-g32) +
					rec.D5220*math.Cos(xomi+rec.Xli-g52) +
					rec.D5232*math.Cos(-xomi+rec.Xli-g52) +
					2.0*(rec.D4410*math.Cos(x2omi+x2li-g44)+
						rec.D4422*math.Cos(x2li-g44)+
						rec.D5421*math.Cos(xomi+x2li-g54)+
						rec.D5433*math.Cos(-xomi+x2li-g54))
				xnddt *= xldot
			}

			if math.Abs(rec.T-rec.Atime) >= stepp {
				iretn = 381
			} else {
				ft = rec.T - rec.Atime
				iretn = 0
			}

			if iretn == 381 {
				rec.Xli = rec.Xli + xldot*delt + xndt*step2
				rec.Xni = rec.Xni + xndt*delt + xnddt*step2
				rec.Atime = rec.Atime + delt
			}
		}

		rec.Nm = rec.Xni + xndt*ft + xnddt*ft*ft*0.5
		xl := rec.Xli + xldot*ft + xndt*ft*ft*0.5

		if rec.Irez != 1 {
			rec.Mm = xl - 2.0*rec.Nodem + 2.0*theta
			rec.Dndt = rec.Nm - rec.NoUnkozai
		} else {
			rec.Mm = xl - rec.Nodem - rec.Argpm + theta
			rec.Dndt = rec.Nm - rec.NoUnkozai
		}
		rec.Nm = rec.NoUnkozai + rec.Dndt
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

func initl(epoch float64, rec *ElsetRec) {
	// Local constants
	const (
		x2o3   = 2.0 / 3.0
		c1     = 1.72027916940703639e-2
		thgr70 = 1.7321343856509374
		fk5r   = 5.07551419432269442e-15
	)

	// Calculate auxiliary epoch quantities
	rec.Eccsq = rec.Ecco * rec.Ecco
	rec.Omeosq = 1.0 - rec.Eccsq
	rec.Rteosq = math.Sqrt(rec.Omeosq)
	rec.Cosio = math.Cos(rec.Inclo)
	rec.Cosio2 = rec.Cosio * rec.Cosio

	// Un-kozai the mean motion
	ak := math.Pow(rec.Xke/rec.NoKozai, x2o3)
	d1 := 0.75 * rec.J2 * (3.0*rec.Cosio2 - 1.0) / (rec.Rteosq * rec.Omeosq)
	ddel := d1 / (ak * ak)
	adel := ak * (1.0 - ddel*ddel - ddel*(1.0/3.0+134.0*ddel*ddel/81.0))
	ddel = d1 / (adel * adel)
	rec.NoUnkozai = rec.NoKozai / (1.0 + ddel)

	rec.Ao = math.Pow(rec.Xke/rec.NoUnkozai, x2o3)
	rec.Sinio = math.Sin(rec.Inclo)
	po := rec.Ao * rec.Omeosq
	rec.Con42 = 1.0 - 5.0*rec.Cosio2
	rec.Con41 = -rec.Con42 - rec.Cosio2 - rec.Cosio2
	rec.Ainv = 1.0 / rec.Ao
	rec.Posq = po * po
	rec.Rp = rec.Ao * (1.0 - rec.Ecco)
	rec.Method = "n"

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

	rec.Gsto = gstime(epoch + 2433281.5)
}

func GetGravConst(whichconst int, rec *ElsetRec) {
	rec.WhichConst = whichconst

	switch whichconst {
	case wgs72old:
		// WGS-72 low precision str#3 constants
		rec.Mu = 398600.79964        // in km3 / s2
		rec.RadiusEarthKm = 6378.135 // km
		rec.Xke = 0.0743669161       // reciprocal of tumin
		rec.Tumin = 1.0 / rec.Xke
		rec.J2 = 0.001082616
		rec.J3 = -0.00000253881
		rec.J4 = -0.00000165597
		rec.J3oj2 = rec.J3 / rec.J2

	case wgs72:
		// WGS-72 constants
		rec.Mu = 398600.8            // in km3 / s2
		rec.RadiusEarthKm = 6378.135 // km
		rec.Xke = 60.0 / math.Sqrt(rec.RadiusEarthKm*rec.RadiusEarthKm*rec.RadiusEarthKm/rec.Mu)
		rec.Tumin = 1.0 / rec.Xke
		rec.J2 = 0.001082616
		rec.J3 = -0.00000253881
		rec.J4 = -0.00000165597
		rec.J3oj2 = rec.J3 / rec.J2

	default: // wgs84
		// WGS-84 constants
		rec.Mu = 398600.5            // in km3 / s2
		rec.RadiusEarthKm = 6378.137 // km
		rec.Xke = 60.0 / math.Sqrt(rec.RadiusEarthKm*rec.RadiusEarthKm*rec.RadiusEarthKm/rec.Mu)
		rec.Tumin = 1.0 / rec.Xke
		rec.J2 = 0.00108262998905
		rec.J3 = -0.00000253215306
		rec.J4 = -0.00000161098761
		rec.J3oj2 = rec.J3 / rec.J2
	}
}

func sgp4init(opsmode string, satrec *ElsetRec) bool {
	// Local variables
	const temp4 = 1.5e-12

	epoch := (satrec.JdsatEpoch + satrec.JdsatEpochF) - 2433281.5

	// Initialize all near-Earth variables to zero
	satrec.Isimp = 0
	satrec.Method = "n"
	satrec.Aycof = 0.0
	satrec.Con41 = 0.0
	satrec.Cc1 = 0.0
	satrec.Cc4 = 0.0
	satrec.Cc5 = 0.0
	satrec.D2 = 0.0
	satrec.D3 = 0.0
	satrec.D4 = 0.0
	satrec.Delmo = 0.0
	satrec.Eta = 0.0
	satrec.Argpdot = 0.0
	satrec.Omgcof = 0.0
	satrec.Sinmao = 0.0
	satrec.T = 0.0
	satrec.T2cof = 0.0
	satrec.T3cof = 0.0
	satrec.T4cof = 0.0
	satrec.T5cof = 0.0
	satrec.X1mth2 = 0.0
	satrec.X7thm1 = 0.0
	satrec.Mdot = 0.0
	satrec.Nodedot = 0.0
	satrec.Xlcof = 0.0
	satrec.Xmcof = 0.0
	satrec.Nodecf = 0.0

	// Initialize all deep-space variables to zero
	satrec.Irez = 0
	satrec.D2201 = 0.0
	satrec.D2211 = 0.0
	satrec.D3210 = 0.0
	satrec.D3222 = 0.0
	satrec.D4410 = 0.0
	satrec.D4422 = 0.0
	satrec.D5220 = 0.0
	satrec.D5232 = 0.0
	satrec.D5421 = 0.0
	satrec.D5433 = 0.0
	satrec.Dedt = 0.0
	satrec.Del1 = 0.0
	satrec.Del2 = 0.0
	satrec.Del3 = 0.0
	satrec.Didt = 0.0
	satrec.Dmdt = 0.0
	satrec.Dnodt = 0.0
	satrec.Domdt = 0.0
	satrec.E3 = 0.0
	satrec.Ee2 = 0.0
	satrec.Peo = 0.0
	satrec.Pgho = 0.0
	satrec.Pho = 0.0
	satrec.Pinco = 0.0
	satrec.Plo = 0.0
	satrec.Se2 = 0.0
	satrec.Se3 = 0.0
	satrec.Sgh2 = 0.0
	satrec.Sgh3 = 0.0
	satrec.Sgh4 = 0.0
	satrec.Sh2 = 0.0
	satrec.Sh3 = 0.0
	satrec.Si2 = 0.0
	satrec.Si3 = 0.0
	satrec.Sl2 = 0.0
	satrec.Sl3 = 0.0
	satrec.Sl4 = 0.0
	satrec.Gsto = 0.0
	satrec.Xfact = 0.0
	satrec.Xgh2 = 0.0
	satrec.Xgh3 = 0.0
	satrec.Xgh4 = 0.0
	satrec.Xh2 = 0.0
	satrec.Xh3 = 0.0
	satrec.Xi2 = 0.0
	satrec.Xi3 = 0.0
	satrec.Xl2 = 0.0
	satrec.Xl3 = 0.0
	satrec.Xl4 = 0.0
	satrec.Xlamo = 0.0
	satrec.Zmol = 0.0
	satrec.Zmos = 0.0
	satrec.Atime = 0.0
	satrec.Xli = 0.0
	satrec.Xni = 0.0

	// Get gravitational constants
	GetGravConst(satrec.WhichConst, satrec)

	satrec.Error = 0
	satrec.OperationMode = opsmode

	// Single averaged mean elements
	satrec.Am = 0.0
	satrec.Em = 0.0
	satrec.Im = 0.0
	satrec.Om = 0.0
	satrec.Mm = 0.0
	satrec.Nm = 0.0

	// Earth constants
	ss := 78.0/satrec.RadiusEarthKm + 1.0
	qzms2ttemp := (120.0 - 78.0) / satrec.RadiusEarthKm
	qzms2t := qzms2ttemp * qzms2ttemp * qzms2ttemp * qzms2ttemp
	x2o3 := 2.0 / 3.0

	satrec.Init = "y"
	satrec.T = 0.0

	// Initialize orbital elements
	initl(epoch, satrec)

	satrec.A = math.Pow(satrec.NoUnkozai*satrec.Tumin, -2.0/3.0)
	satrec.Alta = satrec.A*(1.0+satrec.Ecco) - 1.0
	satrec.Altp = satrec.A*(1.0-satrec.Ecco) - 1.0
	satrec.Error = 0
	if satrec.Omeosq >= 0.0 || satrec.NoUnkozai >= 0.0 {
		satrec.Isimp = 0
		if satrec.Rp < (220.0/satrec.RadiusEarthKm + 1.0) {
			satrec.Isimp = 1
		}

		sfour := ss
		qzms24 := qzms2t
		perige := (satrec.Rp - 1.0) * satrec.RadiusEarthKm

		// For perigees below 156 km, s and qoms2t are altered
		if perige < 156.0 {
			sfour = perige - 78.0
			if perige < 98.0 {
				sfour = 20.0
			}
			qzms24temp := (120.0 - sfour) / satrec.RadiusEarthKm
			qzms24 = qzms24temp * qzms24temp * qzms24temp * qzms24temp
			sfour = sfour/satrec.RadiusEarthKm + 1.0
		}

		pinvsq := 1.0 / satrec.Posq
		tsi := 1.0 / (satrec.Ao - sfour)
		satrec.Eta = satrec.Ao * satrec.Ecco * tsi
		etasq := satrec.Eta * satrec.Eta
		eeta := satrec.Ecco * satrec.Eta
		psisq := math.Abs(1.0 - etasq)
		coef := qzms24 * math.Pow(tsi, 4.0)
		coef1 := coef / math.Pow(psisq, 3.5)

		cc2 := coef1 * satrec.NoUnkozai * (satrec.Ao*(1.0+1.5*etasq+eeta*
			(4.0+etasq)) + 0.375*satrec.J2*tsi/psisq*satrec.Con41*
			(8.0+3.0*etasq*(8.0+etasq)))

		satrec.Cc1 = satrec.Bstar * cc2
		cc3 := 0.0
		if satrec.Ecco > 1.0e-4 {
			cc3 = -2.0 * coef * tsi * satrec.J3oj2 * satrec.NoUnkozai * satrec.Sinio / satrec.Ecco
		}

		satrec.X1mth2 = 1.0 - satrec.Cosio2
		satrec.Cc4 = 2.0 * satrec.NoUnkozai * coef1 * satrec.Ao * satrec.Omeosq *
			(satrec.Eta*(2.0+0.5*etasq) + satrec.Ecco*(0.5+2.0*etasq) -
				satrec.J2*tsi/(satrec.Ao*psisq)*(-3.0*satrec.Con41*(1.0-2.0*eeta+etasq*
					(1.5-0.5*eeta))+0.75*satrec.X1mth2*(2.0*etasq-eeta*(1.0+etasq))*
					math.Cos(2.0*satrec.Argpo)))

		satrec.Cc5 = 2.0 * coef1 * satrec.Ao * satrec.Omeosq * (1.0 + 2.75*(etasq+eeta) + eeta*etasq)

		cosio4 := satrec.Cosio2 * satrec.Cosio2
		temp1 := 1.5 * satrec.J2 * pinvsq * satrec.NoUnkozai
		temp2 := 0.5 * temp1 * satrec.J2 * pinvsq
		temp3 := -0.46875 * satrec.J4 * pinvsq * pinvsq * satrec.NoUnkozai

		satrec.Mdot = satrec.NoUnkozai + 0.5*temp1*satrec.Rteosq*satrec.Con41 + 0.0625*
			temp2*satrec.Rteosq*(13.0-78.0*satrec.Cosio2+137.0*cosio4)

		satrec.Argpdot = -0.5*temp1*satrec.Con42 + 0.0625*temp2*
			(7.0-114.0*satrec.Cosio2+395.0*cosio4) +
			temp3*(3.0-36.0*satrec.Cosio2+49.0*cosio4)

		xhdot1 := -temp1 * satrec.Cosio
		satrec.Nodedot = xhdot1 + (0.5*temp2*(4.0-19.0*satrec.Cosio2)+
			2.0*temp3*(3.0-7.0*satrec.Cosio2))*satrec.Cosio

		xpidot := satrec.Argpdot + satrec.Nodedot
		satrec.Omgcof = satrec.Bstar * cc3 * math.Cos(satrec.Argpo)
		satrec.Xmcof = 0.0

		if satrec.Ecco > 1.0e-4 {
			satrec.Xmcof = -x2o3 * coef * satrec.Bstar / eeta
		}

		satrec.Nodecf = 3.5 * satrec.Omeosq * xhdot1 * satrec.Cc1
		satrec.T2cof = 1.5 * satrec.Cc1

		// sgp4fix for divide by zero with xinco = 180 deg
		if math.Abs(satrec.Cosio+1.0) > 1.5e-12 {
			satrec.Xlcof = -0.25 * satrec.J3oj2 * satrec.Sinio * (3.0 + 5.0*satrec.Cosio) / (1.0 + satrec.Cosio)
		} else {
			satrec.Xlcof = -0.25 * satrec.J3oj2 * satrec.Sinio * (3.0 + 5.0*satrec.Cosio) / temp4
		}

		satrec.Aycof = -0.5 * satrec.J3oj2 * satrec.Sinio

		delmotemp := 1.0 + satrec.Eta*math.Cos(satrec.Mo)
		satrec.Delmo = delmotemp * delmotemp * delmotemp
		satrec.Sinmao = math.Sin(satrec.Mo)
		satrec.X7thm1 = 7.0*satrec.Cosio2 - 1.0

		// Deep space initialization
		if (2 * pi / satrec.NoUnkozai) >= 225.0 {
			satrec.Method = "d"
			satrec.Isimp = 1
			tc := 0.0
			satrec.Inclm = satrec.Inclo

			dscom(epoch, satrec.Ecco, satrec.Argpo, tc, satrec.Inclo, satrec.Nodeo, satrec.NoUnkozai, satrec)

			satrec.Ep = satrec.Ecco
			satrec.Inclp = satrec.Inclo
			satrec.Nodep = satrec.Nodeo
			satrec.Argpp = satrec.Argpo
			satrec.Mp = satrec.Mo

			dpper(satrec.E3, satrec.Ee2, satrec.Peo, satrec.Pgho,
				satrec.Pho, satrec.Pinco, satrec.Plo, satrec.Se2,
				satrec.Se3, satrec.Sgh2, satrec.Sgh3, satrec.Sgh4,
				satrec.Sh2, satrec.Sh3, satrec.Si2, satrec.Si3,
				satrec.Sl2, satrec.Sl3, satrec.Sl4, satrec.T,
				satrec.Xgh2, satrec.Xgh3, satrec.Xgh4, satrec.Xh2,
				satrec.Xh3, satrec.Xi2, satrec.Xi3, satrec.Xl2,
				satrec.Xl3, satrec.Xl4, satrec.Zmol, satrec.Zmos,
				satrec.Init, satrec, satrec.OperationMode)

			satrec.Ecco = satrec.Ep
			satrec.Inclo = satrec.Inclp
			satrec.Nodeo = satrec.Nodep
			satrec.Argpo = satrec.Argpp
			satrec.Mo = satrec.Mp

			satrec.Argpm = 0.0
			satrec.Nodem = 0.0
			satrec.Mm = 0.0

			dsinit(tc, xpidot, satrec)
		}

		// Set variables if not deep space
		if satrec.Isimp != 1 {
			cc1sq := satrec.Cc1 * satrec.Cc1
			satrec.D2 = 4.0 * satrec.Ao * tsi * cc1sq
			temp := satrec.D2 * tsi * satrec.Cc1 / 3.0
			satrec.D3 = (17.0*satrec.Ao + sfour) * temp
			satrec.D4 = 0.5 * temp * satrec.Ao * tsi * (221.0*satrec.Ao + 31.0*sfour) * satrec.Cc1
			satrec.T3cof = satrec.D2 + 2.0*cc1sq
			satrec.T4cof = 0.25 * (3.0*satrec.D3 + satrec.Cc1*(12.0*satrec.D2+10.0*cc1sq))
			satrec.T5cof = 0.2 * (3.0*satrec.D4 +
				12.0*satrec.Cc1*satrec.D3 +
				6.0*satrec.D2*satrec.D2 +
				15.0*cc1sq*(2.0*satrec.D2+cc1sq))
		}
	}

	r := [3]float64{0, 0, 0}
	v := [3]float64{0, 0, 0}

	Sgp4(satrec, 0.0, &r, &v)

	satrec.Init = "n"

	return true

}

func Sgp4(satrec *ElsetRec, tsince float64, r, v *[3]float64) bool {
	const (
		twopi = 2.0 * math.Pi
		temp4 = 1.5e-12
		x2o3  = 2.0 / 3.0
	)

	vkmpersec := satrec.RadiusEarthKm * satrec.Xke / 60.0

	// Clear SGP4 error flag
	satrec.T = tsince
	satrec.Error = 0

	// Update for secular gravity and atmospheric drag
	xmdf := satrec.Mo + satrec.Mdot*satrec.T
	argpdf := satrec.Argpo + satrec.Argpdot*satrec.T
	nodedf := satrec.Nodeo + satrec.Nodedot*satrec.T
	satrec.Argpm = argpdf
	satrec.Mm = xmdf
	t2 := satrec.T * satrec.T
	satrec.Nodem = nodedf + satrec.Nodecf*t2
	tempa := 1.0 - satrec.Cc1*satrec.T
	tempe := satrec.Bstar * satrec.Cc4 * satrec.T
	templ := satrec.T2cof * t2

	delomg := 0.0
	delmtemp := 0.0
	delm := 0.0
	temp := 0.0
	t3 := 0.0
	t4 := 0.0
	mrt := 0.0

	if satrec.Isimp != 1 {
		delomg = satrec.Omgcof * satrec.T
		delmtemp = 1.0 + satrec.Eta*math.Cos(xmdf)
		delm = satrec.Xmcof * (delmtemp*delmtemp*delmtemp - satrec.Delmo)
		temp = delomg + delm
		satrec.Mm = xmdf + temp
		satrec.Argpm = argpdf - temp
		t3 = t2 * satrec.T
		t4 = t3 * satrec.T
		tempa = tempa - satrec.D2*t2 - satrec.D3*t3 - satrec.D4*t4
		tempe = tempe + satrec.Bstar*satrec.Cc5*(math.Sin(satrec.Mm)-satrec.Sinmao)
		templ = templ + satrec.T3cof*t3 + t4*(satrec.T4cof+satrec.T*satrec.T5cof)
	}

	tc := 0.0
	satrec.Nm = satrec.NoUnkozai
	satrec.Em = satrec.Ecco
	satrec.Inclm = satrec.Inclo

	if satrec.Method == "d" {
		tc = satrec.T
		dspace(tc, satrec)
	}

	if satrec.Nm <= 0.0 {
		satrec.Error = 2
		return false
	}

	satrec.Am = math.Pow((satrec.Xke/satrec.Nm), x2o3) * tempa * tempa
	satrec.Nm = satrec.Xke / math.Pow(satrec.Am, 1.5)
	satrec.Em = satrec.Em - tempe

	if satrec.Em >= 1.0 || satrec.Em < -0.001 {
		satrec.Error = 1
		return false
	}

	if satrec.Em < 1.0e-6 {
		satrec.Em = 1.0e-6
	}

	satrec.Mm = satrec.Mm + satrec.NoUnkozai*templ
	xlm := satrec.Mm + satrec.Argpm + satrec.Nodem
	satrec.Emsq = satrec.Em * satrec.Em
	temp = 1.0 - satrec.Emsq

	satrec.Nodem = math.Mod(satrec.Nodem, twopi)
	satrec.Argpm = math.Mod(satrec.Argpm, twopi)
	xlm = math.Mod(xlm, twopi)
	satrec.Mm = math.Mod(xlm-satrec.Argpm-satrec.Nodem, twopi)

	// Compute extra mean quantities
	satrec.Sinim = math.Sin(satrec.Inclm)
	satrec.Cosim = math.Cos(satrec.Inclm)

	// Add lunar-solar periodics
	satrec.Ep = satrec.Em
	xincp := satrec.Inclm
	satrec.Inclp = satrec.Inclm
	satrec.Argpp = satrec.Argpm
	satrec.Nodep = satrec.Nodem
	satrec.Mp = satrec.Mm
	sinip := satrec.Sinim
	cosip := satrec.Cosim

	if satrec.Method == "d" {
		dpper(satrec.E3, satrec.Ee2, satrec.Peo, satrec.Pgho,
			satrec.Pho, satrec.Pinco, satrec.Plo, satrec.Se2,
			satrec.Se3, satrec.Sgh2, satrec.Sgh3, satrec.Sgh4,
			satrec.Sh2, satrec.Sh3, satrec.Si2, satrec.Si3,
			satrec.Sl2, satrec.Sl3, satrec.Sl4, satrec.T,
			satrec.Xgh2, satrec.Xgh3, satrec.Xgh4, satrec.Xh2,
			satrec.Xh3, satrec.Xi2, satrec.Xi3, satrec.Xl2,
			satrec.Xl3, satrec.Xl4, satrec.Zmol, satrec.Zmos,
			"n", satrec, satrec.OperationMode)
		xincp = satrec.Inclp
		if xincp < 0.0 {
			xincp = -xincp
			satrec.Nodep += math.Pi
			satrec.Argpp -= math.Pi
		}
		if satrec.Ep < 0.0 || satrec.Ep > 1.0 {
			satrec.Error = 3
			return false
		}
	}

	// Long period periodics
	if satrec.Method == "d" {
		sinip = math.Sin(xincp)
		cosip = math.Cos(xincp)
		satrec.Aycof = -0.5 * satrec.J3oj2 * sinip

		if math.Abs(cosip+1.0) > 1.5e-12 {
			satrec.Xlcof = -0.25 * satrec.J3oj2 * sinip * (3.0 + 5.0*cosip) / (1.0 + cosip)
		} else {
			satrec.Xlcof = -0.25 * satrec.J3oj2 * sinip * (3.0 + 5.0*cosip) / temp4
		}
	}

	axnl := satrec.Ep * math.Cos(satrec.Argpp)
	temp = 1.0 / (satrec.Am * (1.0 - satrec.Ep*satrec.Ep))
	aynl := satrec.Ep*math.Sin(satrec.Argpp) + temp*satrec.Aycof
	xl := satrec.Mp + satrec.Argpp + satrec.Nodep + temp*satrec.Xlcof*axnl

	// Solve Kepler's equation
	u := math.Mod(xl-satrec.Nodep, twopi)
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
	pl := satrec.Am * (1.0 - el2)

	if pl < 0.0 {
		satrec.Error = 4
		return false
	}

	rl := satrec.Am * (1.0 - ecose)
	rdotl := math.Sqrt(satrec.Am) * esine / rl
	rvdotl := math.Sqrt(pl) / rl
	betal := math.Sqrt(1.0 - el2)
	temp = esine / (1.0 + betal)
	sinu := satrec.Am / rl * (sineo1 - aynl - axnl*temp)
	cosu := satrec.Am / rl * (coseo1 - axnl + aynl*temp)
	su := math.Atan2(sinu, cosu)

	sin2u := (cosu + cosu) * sinu
	cos2u := 1.0 - 2.0*sinu*sinu
	temp = 1.0 / pl
	temp1 := 0.5 * satrec.J2 * temp
	temp2 := temp1 * temp

	// Update for short period periodics
	if satrec.Method == "d" {
		cosisq := cosip * cosip
		satrec.Con41 = 3.0*cosisq - 1.0
		satrec.X1mth2 = 1.0 - cosisq
		satrec.X7thm1 = 7.0*cosisq - 1.0
	}

	mrt = rl*(1.0-1.5*temp2*betal*satrec.Con41) + 0.5*temp1*satrec.X1mth2*cos2u
	su -= 0.25 * temp2 * satrec.X7thm1 * sin2u
	xnode := satrec.Nodep + 1.5*temp2*cosip*sin2u
	xinc := xincp + 1.5*temp2*cosip*sinip*cos2u
	mvt := rdotl - satrec.Nm*temp1*satrec.X1mth2*sin2u/satrec.Xke
	rvdot := rvdotl + satrec.Nm*temp1*(satrec.X1mth2*cos2u+1.5*satrec.Con41)/satrec.Xke

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
	r[0] = (mrt * ux) * satrec.RadiusEarthKm
	r[1] = (mrt * uy) * satrec.RadiusEarthKm
	r[2] = (mrt * uz) * satrec.RadiusEarthKm
	v[0] = (mvt*ux + rvdot*vx) * vkmpersec
	v[1] = (mvt*uy + rvdot*vy) * vkmpersec
	v[2] = (mvt*uz + rvdot*vz) * vkmpersec

	// Sgp4fix for decaying satellites
	if mrt < 1.0 {
		satrec.Error = 6
		return false
	}

	return true
}

func jday(year, mon, day, hr, minute int, sec float64) (float64, float64) {
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
