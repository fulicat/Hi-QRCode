/*
    QRCode
    update: 2015-03-18 add border set by Jack.Chan
    update: 2015-05-28 add complete callback function
    update: 2016-03-27 by Jack.Chan
	
	usage:
	
$('#preview').html('').qrcode({
	width: 200,
	height: 200,
	foreground: '#000000', //color
	borderWidth: 10, //default value
	logo: '/images/logo.png', //logo url
	logoWidth: 30,
	logoHeight: 30,
	logoBackColor: '#ffffff', //暂未实现
	text: 'test',
	complete: function(){}
});

 */
(function(a) {
	a.fn.qrcode = function(n) {
		var isRetina = (function(){
			var root = (typeof exports === 'undefined' ? window : exports);
			var mediaQuery = '(-webkit-min-device-pixel-ratio: 1.5), (min--moz-device-pixel-ratio: 1.5), (-o-min-device-pixel-ratio: 3/2), (min-resolution: 1.5dppx)';
			if(root.devicePixelRatio > 1){
				return true;
			};
			if(root.matchMedia && root.matchMedia(mediaQuery).matches){
				return true;
			};
			return false;
		})();

		var w;
		function r(h) {
			this.mode = w;
			this.data = h;
		}
		function d(h, m) {
			this.typeNumber = h;
			this.errorCorrectLevel = m;
			this.modules = null;
			this.moduleCount = 0;
			this.dataCache = null;
			this.dataList = [];
		}
		function b(m, p) {
			if (void 0 == m.length) {
				throw Error(m.length + "/" + p);
			}
			for (var o = 0; o < m.length && 0 == m[o]; ) {
				o++;
			}
			this.num = Array(m.length - o + p);
			for (var h = 0; h < m.length - o; h++) {
				this.num[h] = m[h + o];
			}
		}
		function c(h, m) {
			this.totalCount = h;
			this.dataCount = m;
		}
		function v() {
			this.buffer = [];
			this.length = 0;
		}
		r.prototype = {
			getLength:function() {
				return this.data.length;
			},
			write:function(h) {
				for (var m = 0; m < this.data.length; m++) {
					h.put(this.data.charCodeAt(m), 8);
				}
			}
		};
		d.prototype = {
			addData:function(h) {
				this.dataList.push(new r(h));
				this.dataCache = null;
			},
			isDark:function(h, m) {
				if (0 > h || this.moduleCount <= h || 0 > m || this.moduleCount <= m) {
					throw Error(h + "," + m);
				}
				return this.modules[h][m];
			},
			getModuleCount:function() {
				return this.moduleCount;
			},
			make:function() {
				if (1 > this.typeNumber) {
					for (var m = 1, m = 1; 40 > m; m++) {
						for (var q = c.getRSBlocks(m, this.errorCorrectLevel), p = new v(), h = 0, o = 0; o < q.length; o++) {
							h += q[o].dataCount;
						}
						for (o = 0; o < this.dataList.length; o++) {
							q = this.dataList[o], p.put(q.mode, 4), p.put(q.getLength(), g.getLengthInBits(q.mode, m)), 
							q.write(p);
						}
						if (p.getLengthInBits() <= 8 * h) {
							break;
						}
					}
					this.typeNumber = m;
				}
				this.makeImpl(!1, this.getBestMaskPattern());
			},
			makeImpl:function(m, p) {
				this.moduleCount = 4 * this.typeNumber + 17;
				this.modules = Array(this.moduleCount);
				for (var o = 0; o < this.moduleCount; o++) {
					this.modules[o] = Array(this.moduleCount);
					for (var h = 0; h < this.moduleCount; h++) {
						this.modules[o][h] = null;
					}
				}
				this.setupPositionProbePattern(0, 0);
				this.setupPositionProbePattern(this.moduleCount - 7, 0);
				this.setupPositionProbePattern(0, this.moduleCount - 7);
				this.setupPositionAdjustPattern();
				this.setupTimingPattern();
				this.setupTypeInfo(m, p);
				7 <= this.typeNumber && this.setupTypeNumber(m);
				null == this.dataCache && (this.dataCache = d.createData(this.typeNumber, this.errorCorrectLevel, this.dataList));
				this.mapData(this.dataCache, p);
			},
			setupPositionProbePattern:function(m, p) {
				for (var o = -1; 7 >= o; o++) {
					if (!(-1 >= m + o || this.moduleCount <= m + o)) {
						for (var h = -1; 7 >= h; h++) {
							-1 >= p + h || this.moduleCount <= p + h || (this.modules[m + o][p + h] = 0 <= o && 6 >= o && (0 == h || 6 == h) || 0 <= h && 6 >= h && (0 == o || 6 == o) || 2 <= o && 4 >= o && 2 <= h && 4 >= h ? !0 :!1);
						}
					}
				}
			},
			getBestMaskPattern:function() {
				for (var m = 0, p = 0, o = 0; 8 > o; o++) {
					this.makeImpl(!0, o);
					var h = g.getLostPoint(this);
					if (0 == o || m > h) {
						m = h, p = o;
					}
				}
				return p;
			},
			createMovieClip:function(m, q, p) {
				m = m.createEmptyMovieClip(q, p);
				this.make();
				for (q = 0; q < this.modules.length; q++) {
					for (var p = 1 * q, h = 0; h < this.modules[q].length; h++) {
						var o = 1 * h;
						this.modules[q][h] && (m.beginFill(0, 100), m.moveTo(o, p), m.lineTo(o + 1, p), 
						m.lineTo(o + 1, p + 1), m.lineTo(o, p + 1), m.endFill());
					}
				}
				return m;
			},
			setupTimingPattern:function() {
				for (var h = 8; h < this.moduleCount - 8; h++) {
					null == this.modules[h][6] && (this.modules[h][6] = 0 == h % 2);
				}
				for (h = 8; h < this.moduleCount - 8; h++) {
					null == this.modules[6][h] && (this.modules[6][h] = 0 == h % 2);
				}
			},
			setupPositionAdjustPattern:function() {
				for (var m = g.getPatternPosition(this.typeNumber), u = 0; u < m.length; u++) {
					for (var s = 0; s < m.length; s++) {
						var h = m[u], q = m[s];
						if (null == this.modules[h][q]) {
							for (var p = -2; 2 >= p; p++) {
								for (var o = -2; 2 >= o; o++) {
									this.modules[h + p][q + o] = -2 == p || 2 == p || -2 == o || 2 == o || 0 == p && 0 == o ? !0 :!1;
								}
							}
						}
					}
				}
			},
			setupTypeNumber:function(m) {
				for (var p = g.getBCHTypeNumber(this.typeNumber), o = 0; 18 > o; o++) {
					var h = !m && 1 == (p >> o & 1);
					this.modules[Math.floor(o / 3)][o % 3 + this.moduleCount - 8 - 3] = h;
				}
				for (o = 0; 18 > o; o++) {
					h = !m && 1 == (p >> o & 1), this.modules[o % 3 + this.moduleCount - 8 - 3][Math.floor(o / 3)] = h;
				}
			},
			setupTypeInfo:function(m, q) {
				for (var p = g.getBCHTypeInfo(this.errorCorrectLevel << 3 | q), h = 0; 15 > h; h++) {
					var o = !m && 1 == (p >> h & 1);
					6 > h ? this.modules[h][8] = o :8 > h ? this.modules[h + 1][8] = o :this.modules[this.moduleCount - 15 + h][8] = o;
				}
				for (h = 0; 15 > h; h++) {
					o = !m && 1 == (p >> h & 1), 8 > h ? this.modules[8][this.moduleCount - h - 1] = o :9 > h ? this.modules[8][15 - h - 1 + 1] = o :this.modules[8][15 - h - 1] = o;
				}
				this.modules[this.moduleCount - 8][8] = !m;
			},
			mapData:function(y, u) {
				for (var s = -1, x = this.moduleCount - 1, q = 7, p = 0, m = this.moduleCount - 1; 0 < m; m -= 2) {
					for (6 == m && m--; ;) {
						for (var o = 0; 2 > o; o++) {
							if (null == this.modules[x][m - o]) {
								var h = !1;
								p < y.length && (h = 1 == (y[p] >>> q & 1));
								g.getMask(u, x, m - o) && (h = !h);
								this.modules[x][m - o] = h;
								q--;
								-1 == q && (p++, q = 7);
							}
						}
						x += s;
						if (0 > x || this.moduleCount <= x) {
							x -= s;
							s = -s;
							break;
						}
					}
				}
			}
		};
		d.PAD0 = 236;
		d.PAD1 = 17;
		d.createData = function(m, s, q) {
			for (var s = c.getRSBlocks(m, s), h = new v(), p = 0; p < q.length; p++) {
				var o = q[p];
				h.put(o.mode, 4);
				h.put(o.getLength(), g.getLengthInBits(o.mode, m));
				o.write(h);
			}
			for (p = m = 0; p < s.length; p++) {
				m += s[p].dataCount;
			}
			if (h.getLengthInBits() > 8 * m) {
				throw Error("code length overflow. (" + h.getLengthInBits() + ">" + 8 * m + ")");
			}
			for (h.getLengthInBits() + 4 <= 8 * m && h.put(0, 4); 0 != h.getLengthInBits() % 8; ) {
				h.putBit(!1);
			}
			for (;!(h.getLengthInBits() >= 8 * m); ) {
				h.put(d.PAD0, 8);
				if (h.getLengthInBits() >= 8 * m) {
					break;
				}
				h.put(d.PAD1, 8);
			}
			return d.createBytes(h, s);
		};
		d.createBytes = function(B, z) {
			for (var y = 0, A = 0, x = 0, u = Array(z.length), p = Array(z.length), s = 0; s < z.length; s++) {
				var m = z[s].dataCount, q = z[s].totalCount - m, A = Math.max(A, m), x = Math.max(x, q);
				u[s] = Array(m);
				for (var o = 0; o < u[s].length; o++) {
					u[s][o] = 255 & B.buffer[o + y];
				}
				y += m;
				o = g.getErrorCorrectPolynomial(q);
				m = new b(u[s], o.getLength() - 1).mod(o);
				p[s] = Array(o.getLength() - 1);
				for (o = 0; o < p[s].length; o++) {
					q = o + m.getLength() - p[s].length, p[s][o] = 0 <= q ? m.get(q) :0;
				}
			}
			for (o = s = 0; o < z.length; o++) {
				s += z[o].totalCount;
			}
			y = Array(s);
			for (o = m = 0; o < A; o++) {
				for (s = 0; s < z.length; s++) {
					o < u[s].length && (y[m++] = u[s][o]);
				}
			}
			for (o = 0; o < x; o++) {
				for (s = 0; s < z.length; s++) {
					o < p[s].length && (y[m++] = p[s][o]);
				}
			}
			return y;
		};
		w = 4;
		for (var g = {
			PATTERN_POSITION_TABLE:[ [], [ 6, 18 ], [ 6, 22 ], [ 6, 26 ], [ 6, 30 ], [ 6, 34 ], [ 6, 22, 38 ], [ 6, 24, 42 ], [ 6, 26, 46 ], [ 6, 28, 50 ], [ 6, 30, 54 ], [ 6, 32, 58 ], [ 6, 34, 62 ], [ 6, 26, 46, 66 ], [ 6, 26, 48, 70 ], [ 6, 26, 50, 74 ], [ 6, 30, 54, 78 ], [ 6, 30, 56, 82 ], [ 6, 30, 58, 86 ], [ 6, 34, 62, 90 ], [ 6, 28, 50, 72, 94 ], [ 6, 26, 50, 74, 98 ], [ 6, 30, 54, 78, 102 ], [ 6, 28, 54, 80, 106 ], [ 6, 32, 58, 84, 110 ], [ 6, 30, 58, 86, 114 ], [ 6, 34, 62, 90, 118 ], [ 6, 26, 50, 74, 98, 122 ], [ 6, 30, 54, 78, 102, 126 ], [ 6, 26, 52, 78, 104, 130 ], [ 6, 30, 56, 82, 108, 134 ], [ 6, 34, 60, 86, 112, 138 ], [ 6, 30, 58, 86, 114, 142 ], [ 6, 34, 62, 90, 118, 146 ], [ 6, 30, 54, 78, 102, 126, 150 ], [ 6, 24, 50, 76, 102, 128, 154 ], [ 6, 28, 54, 80, 106, 132, 158 ], [ 6, 32, 58, 84, 110, 136, 162 ], [ 6, 26, 54, 82, 110, 138, 166 ], [ 6, 30, 58, 86, 114, 142, 170 ] ],
			G15:1335,
			G18:7973,
			G15_MASK:21522,
			getBCHTypeInfo:function(h) {
				for (var m = h << 10; 0 <= g.getBCHDigit(m) - g.getBCHDigit(g.G15); ) {
					m ^= g.G15 << g.getBCHDigit(m) - g.getBCHDigit(g.G15);
				}
				return (h << 10 | m) ^ g.G15_MASK;
			},
			getBCHTypeNumber:function(h) {
				for (var m = h << 12; 0 <= g.getBCHDigit(m) - g.getBCHDigit(g.G18); ) {
					m ^= g.G18 << g.getBCHDigit(m) - g.getBCHDigit(g.G18);
				}
				return h << 12 | m;
			},
			getBCHDigit:function(h) {
				for (var m = 0; 0 != h; ) {
					m++, h >>>= 1;
				}
				return m;
			},
			getPatternPosition:function(h) {
				return g.PATTERN_POSITION_TABLE[h - 1];
			},
			getMask:function(h, o, m) {
				switch (h) {
				  case 0:
					return 0 == (o + m) % 2;

				  case 1:
					return 0 == o % 2;

				  case 2:
					return 0 == m % 3;

				  case 3:
					return 0 == (o + m) % 3;

				  case 4:
					return 0 == (Math.floor(o / 2) + Math.floor(m / 3)) % 2;

				  case 5:
					return 0 == o * m % 2 + o * m % 3;

				  case 6:
					return 0 == (o * m % 2 + o * m % 3) % 2;

				  case 7:
					return 0 == (o * m % 3 + (o + m) % 2) % 2;

				  default:
					throw Error("bad maskPattern:" + h);
				}
			},
			getErrorCorrectPolynomial:function(h) {
				for (var o = new b([ 1 ], 0), m = 0; m < h; m++) {
					o = o.multiply(new b([ 1, f.gexp(m) ], 0));
				}
				return o;
			},
			getLengthInBits:function(h, m) {
				if (1 <= m && 10 > m) {
					switch (h) {
					  case 1:
						return 10;

					  case 2:
						return 9;

					  case w:
						return 8;

					  case 8:
						return 8;

					  default:
						throw Error("mode:" + h);
					}
				} else {
					if (27 > m) {
						switch (h) {
						  case 1:
							return 12;

						  case 2:
							return 11;

						  case w:
							return 16;

						  case 8:
							return 10;

						  default:
							throw Error("mode:" + h);
						}
					} else {
						if (41 > m) {
							switch (h) {
							  case 1:
								return 14;

							  case 2:
								return 13;

							  case w:
								return 16;

							  case 8:
								return 12;

							  default:
								throw Error("mode:" + h);
							}
						} else {
							throw Error("type:" + m);
						}
					}
				}
			},
			getLostPoint:function(z) {
				for (var x = z.getModuleCount(), u = 0, y = 0; y < x; y++) {
					for (var s = 0; s < x; s++) {
						for (var q = 0, m = z.isDark(y, s), p = -1; 1 >= p; p++) {
							if (!(0 > y + p || x <= y + p)) {
								for (var o = -1; 1 >= o; o++) {
									0 > s + o || x <= s + o || 0 == p && 0 == o || m == z.isDark(y + p, s + o) && q++;
								}
							}
						}
						5 < q && (u += 3 + q - 5);
					}
				}
				for (y = 0; y < x - 1; y++) {
					for (s = 0; s < x - 1; s++) {
						if (q = 0, z.isDark(y, s) && q++, z.isDark(y + 1, s) && q++, z.isDark(y, s + 1) && q++, 
						z.isDark(y + 1, s + 1) && q++, 0 == q || 4 == q) {
							u += 3;
						}
					}
				}
				for (y = 0; y < x; y++) {
					for (s = 0; s < x - 6; s++) {
						z.isDark(y, s) && !z.isDark(y, s + 1) && z.isDark(y, s + 2) && z.isDark(y, s + 3) && z.isDark(y, s + 4) && !z.isDark(y, s + 5) && z.isDark(y, s + 6) && (u += 40);
					}
				}
				for (s = 0; s < x; s++) {
					for (y = 0; y < x - 6; y++) {
						z.isDark(y, s) && !z.isDark(y + 1, s) && z.isDark(y + 2, s) && z.isDark(y + 3, s) && z.isDark(y + 4, s) && !z.isDark(y + 5, s) && z.isDark(y + 6, s) && (u += 40);
					}
				}
				for (s = q = 0; s < x; s++) {
					for (y = 0; y < x; y++) {
						z.isDark(y, s) && q++;
					}
				}
				z = Math.abs(100 * q / x / x - 50) / 5;
				return u + 10 * z;
			}
		}, f = {
			glog:function(h) {
				if (1 > h) {
					throw Error("glog(" + h + ")");
				}
				return f.LOG_TABLE[h];
			},
			gexp:function(h) {
				for (;0 > h; ) {
					h += 255;
				}
				for (;256 <= h; ) {
					h -= 255;
				}
				return f.EXP_TABLE[h];
			},
			EXP_TABLE:Array(256),
			LOG_TABLE:Array(256)
		}, e = 0; 8 > e; e++) {
			f.EXP_TABLE[e] = 1 << e;
		}
		for (e = 8; 256 > e; e++) {
			f.EXP_TABLE[e] = f.EXP_TABLE[e - 4] ^ f.EXP_TABLE[e - 5] ^ f.EXP_TABLE[e - 6] ^ f.EXP_TABLE[e - 8];
		}
		for (e = 0; 255 > e; e++) {
			f.LOG_TABLE[f.EXP_TABLE[e]] = e;
		}
		b.prototype = {
			get:function(h) {
				return this.num[h];
			},
			getLength:function() {
				return this.num.length;
			},
			multiply:function(m) {
				for (var p = Array(this.getLength() + m.getLength() - 1), o = 0; o < this.getLength(); o++) {
					for (var h = 0; h < m.getLength(); h++) {
						p[o + h] ^= f.gexp(f.glog(this.get(o)) + f.glog(m.get(h)));
					}
				}
				return new b(p, 0);
			},
			mod:function(m) {
				if (0 > this.getLength() - m.getLength()) {
					return this;
				}
				for (var p = f.glog(this.get(0)) - f.glog(m.get(0)), o = Array(this.getLength()), h = 0; h < this.getLength(); h++) {
					o[h] = this.get(h);
				}
				for (h = 0; h < m.getLength(); h++) {
					o[h] ^= f.gexp(f.glog(m.get(h)) + p);
				}
				return new b(o, 0).mod(m);
			}
		};
		c.RS_BLOCK_TABLE = [ [ 1, 26, 19 ], [ 1, 26, 16 ], [ 1, 26, 13 ], [ 1, 26, 9 ], [ 1, 44, 34 ], [ 1, 44, 28 ], [ 1, 44, 22 ], [ 1, 44, 16 ], [ 1, 70, 55 ], [ 1, 70, 44 ], [ 2, 35, 17 ], [ 2, 35, 13 ], [ 1, 100, 80 ], [ 2, 50, 32 ], [ 2, 50, 24 ], [ 4, 25, 9 ], [ 1, 134, 108 ], [ 2, 67, 43 ], [ 2, 33, 15, 2, 34, 16 ], [ 2, 33, 11, 2, 34, 12 ], [ 2, 86, 68 ], [ 4, 43, 27 ], [ 4, 43, 19 ], [ 4, 43, 15 ], [ 2, 98, 78 ], [ 4, 49, 31 ], [ 2, 32, 14, 4, 33, 15 ], [ 4, 39, 13, 1, 40, 14 ], [ 2, 121, 97 ], [ 2, 60, 38, 2, 61, 39 ], [ 4, 40, 18, 2, 41, 19 ], [ 4, 40, 14, 2, 41, 15 ], [ 2, 146, 116 ], [ 3, 58, 36, 2, 59, 37 ], [ 4, 36, 16, 4, 37, 17 ], [ 4, 36, 12, 4, 37, 13 ], [ 2, 86, 68, 2, 87, 69 ], [ 4, 69, 43, 1, 70, 44 ], [ 6, 43, 19, 2, 44, 20 ], [ 6, 43, 15, 2, 44, 16 ], [ 4, 101, 81 ], [ 1, 80, 50, 4, 81, 51 ], [ 4, 50, 22, 4, 51, 23 ], [ 3, 36, 12, 8, 37, 13 ], [ 2, 116, 92, 2, 117, 93 ], [ 6, 58, 36, 2, 59, 37 ], [ 4, 46, 20, 6, 47, 21 ], [ 7, 42, 14, 4, 43, 15 ], [ 4, 133, 107 ], [ 8, 59, 37, 1, 60, 38 ], [ 8, 44, 20, 4, 45, 21 ], [ 12, 33, 11, 4, 34, 12 ], [ 3, 145, 115, 1, 146, 116 ], [ 4, 64, 40, 5, 65, 41 ], [ 11, 36, 16, 5, 37, 17 ], [ 11, 36, 12, 5, 37, 13 ], [ 5, 109, 87, 1, 110, 88 ], [ 5, 65, 41, 5, 66, 42 ], [ 5, 54, 24, 7, 55, 25 ], [ 11, 36, 12 ], [ 5, 122, 98, 1, 123, 99 ], [ 7, 73, 45, 3, 74, 46 ], [ 15, 43, 19, 2, 44, 20 ], [ 3, 45, 15, 13, 46, 16 ], [ 1, 135, 107, 5, 136, 108 ], [ 10, 74, 46, 1, 75, 47 ], [ 1, 50, 22, 15, 51, 23 ], [ 2, 42, 14, 17, 43, 15 ], [ 5, 150, 120, 1, 151, 121 ], [ 9, 69, 43, 4, 70, 44 ], [ 17, 50, 22, 1, 51, 23 ], [ 2, 42, 14, 19, 43, 15 ], [ 3, 141, 113, 4, 142, 114 ], [ 3, 70, 44, 11, 71, 45 ], [ 17, 47, 21, 4, 48, 22 ], [ 9, 39, 13, 16, 40, 14 ], [ 3, 135, 107, 5, 136, 108 ], [ 3, 67, 41, 13, 68, 42 ], [ 15, 54, 24, 5, 55, 25 ], [ 15, 43, 15, 10, 44, 16 ], [ 4, 144, 116, 4, 145, 117 ], [ 17, 68, 42 ], [ 17, 50, 22, 6, 51, 23 ], [ 19, 46, 16, 6, 47, 17 ], [ 2, 139, 111, 7, 140, 112 ], [ 17, 74, 46 ], [ 7, 54, 24, 16, 55, 25 ], [ 34, 37, 13 ], [ 4, 151, 121, 5, 152, 122 ], [ 4, 75, 47, 14, 76, 48 ], [ 11, 54, 24, 14, 55, 25 ], [ 16, 45, 15, 14, 46, 16 ], [ 6, 147, 117, 4, 148, 118 ], [ 6, 73, 45, 14, 74, 46 ], [ 11, 54, 24, 16, 55, 25 ], [ 30, 46, 16, 2, 47, 17 ], [ 8, 132, 106, 4, 133, 107 ], [ 8, 75, 47, 13, 76, 48 ], [ 7, 54, 24, 22, 55, 25 ], [ 22, 45, 15, 13, 46, 16 ], [ 10, 142, 114, 2, 143, 115 ], [ 19, 74, 46, 4, 75, 47 ], [ 28, 50, 22, 6, 51, 23 ], [ 33, 46, 16, 4, 47, 17 ], [ 8, 152, 122, 4, 153, 123 ], [ 22, 73, 45, 3, 74, 46 ], [ 8, 53, 23, 26, 54, 24 ], [ 12, 45, 15, 28, 46, 16 ], [ 3, 147, 117, 10, 148, 118 ], [ 3, 73, 45, 23, 74, 46 ], [ 4, 54, 24, 31, 55, 25 ], [ 11, 45, 15, 31, 46, 16 ], [ 7, 146, 116, 7, 147, 117 ], [ 21, 73, 45, 7, 74, 46 ], [ 1, 53, 23, 37, 54, 24 ], [ 19, 45, 15, 26, 46, 16 ], [ 5, 145, 115, 10, 146, 116 ], [ 19, 75, 47, 10, 76, 48 ], [ 15, 54, 24, 25, 55, 25 ], [ 23, 45, 15, 25, 46, 16 ], [ 13, 145, 115, 3, 146, 116 ], [ 2, 74, 46, 29, 75, 47 ], [ 42, 54, 24, 1, 55, 25 ], [ 23, 45, 15, 28, 46, 16 ], [ 17, 145, 115 ], [ 10, 74, 46, 23, 75, 47 ], [ 10, 54, 24, 35, 55, 25 ], [ 19, 45, 15, 35, 46, 16 ], [ 17, 145, 115, 1, 146, 116 ], [ 14, 74, 46, 21, 75, 47 ], [ 29, 54, 24, 19, 55, 25 ], [ 11, 45, 15, 46, 46, 16 ], [ 13, 145, 115, 6, 146, 116 ], [ 14, 74, 46, 23, 75, 47 ], [ 44, 54, 24, 7, 55, 25 ], [ 59, 46, 16, 1, 47, 17 ], [ 12, 151, 121, 7, 152, 122 ], [ 12, 75, 47, 26, 76, 48 ], [ 39, 54, 24, 14, 55, 25 ], [ 22, 45, 15, 41, 46, 16 ], [ 6, 151, 121, 14, 152, 122 ], [ 6, 75, 47, 34, 76, 48 ], [ 46, 54, 24, 10, 55, 25 ], [ 2, 45, 15, 64, 46, 16 ], [ 17, 152, 122, 4, 153, 123 ], [ 29, 74, 46, 14, 75, 47 ], [ 49, 54, 24, 10, 55, 25 ], [ 24, 45, 15, 46, 46, 16 ], [ 4, 152, 122, 18, 153, 123 ], [ 13, 74, 46, 32, 75, 47 ], [ 48, 54, 24, 14, 55, 25 ], [ 42, 45, 15, 32, 46, 16 ], [ 20, 147, 117, 4, 148, 118 ], [ 40, 75, 47, 7, 76, 48 ], [ 43, 54, 24, 22, 55, 25 ], [ 10, 45, 15, 67, 46, 16 ], [ 19, 148, 118, 6, 149, 119 ], [ 18, 75, 47, 31, 76, 48 ], [ 34, 54, 24, 34, 55, 25 ], [ 20, 45, 15, 61, 46, 16 ] ];
		c.getRSBlocks = function(A, y) {
			var x = c.getRsBlockTable(A, y);
			if (void 0 == x) {
				throw Error("bad rs block @ typeNumber:" + A + "/errorCorrectLevel:" + y);
			}
			for (var z = x.length / 3, u = [], s = 0; s < z; s++) {
				for (var p = x[3 * s + 0], q = x[3 * s + 1], o = x[3 * s + 2], m = 0; m < p; m++) {
					u.push(new c(q, o));
				}
			}
			return u;
		};
		c.getRsBlockTable = function(h, m) {
			switch (m) {
			  case 1:
				return c.RS_BLOCK_TABLE[4 * (h - 1) + 0];

			  case 0:
				return c.RS_BLOCK_TABLE[4 * (h - 1) + 1];

			  case 3:
				return c.RS_BLOCK_TABLE[4 * (h - 1) + 2];

			  case 2:
				return c.RS_BLOCK_TABLE[4 * (h - 1) + 3];
			}
		};
		v.prototype = {
			get:function(h) {
				return 1 == (this.buffer[Math.floor(h / 8)] >>> 7 - h % 8 & 1);
			},
			put:function(h, o) {
				for (var m = 0; m < o; m++) {
					this.putBit(1 == (h >>> o - m - 1 & 1));
				}
			},
			getLengthInBits:function() {
				return this.length;
			},
			putBit:function(h) {
				var m = Math.floor(this.length / 8);
				this.buffer.length <= m && this.buffer.push(0);
				h && (this.buffer[m] |= 128 >>> this.length % 8);
				this.length++;
			}
		};
		"string" === typeof n && (n = {
			text:n
		});
		n = a.extend({}, {
			render:"canvas",
			width:240,
			height:240,
			borderWidth:10,
			borderColor:'#fff',
			typeNumber:-1,
			correctLevel:2,
			background:"#ffffff",
			foreground:"#000000",
			logo: '', //logo url
			logoWidth: 30,
			logoHeight: 30,
			logoBackColor: '#ff0000',
			complete: function(){}
		}, n);
		return this.each(function() {
			var y;
			if ("canvas" == n.render) {
				y = new d(n.typeNumber, n.correctLevel);
				y.addData(n.text);
				y.make();
				var u = document.createElement("canvas");
				u.width = n.width;
				u.height = n.height;
				if(isRetina){
					n.width = (n.width*2);
					n.height = (n.height*2);
					u.width = n.width;
					u.height = n.width;
					u.style.width = (u.width/2)+'px';
					u.style.height = (u.height/2)+'px';
					n.borderWidth = (n.borderWidth * 4);
					n.logoWidth = (n.logoWidth * 2);
					n.logoHeight = (n.logoHeight * 2);
				}else{
					n.borderWidth = (n.borderWidth * 2);
				};
				for (var s = u.getContext("2d"), x = (n.width-n.borderWidth) / y.getModuleCount(), q = (n.height-n.borderWidth) / y.getModuleCount(), p = 0; p < y.getModuleCount(); p++) {
					for (var m = 0; m < y.getModuleCount(); m++) {
						s.fillStyle = y.isDark(p, m) ? n.foreground :n.background;
						var o = Math.ceil((m + 1) * x) - Math.floor(m * x), h = Math.ceil((p + 1) * x) - Math.floor(p * x);
						s.fillRect(Math.round(m * x) + (n.borderWidth/2), Math.round(p * q) + (n.borderWidth/2), o, h);
					}
					if(n.borderWidth){
						s.lineWidth = n.borderWidth;
						s.strokeStyle = n.borderColor;
						s.strokeRect(0, 0, u.width, u.height);
					};
				}

				// var _marginLeft = parseInt(u.style.width) - (n.logoWidth / 2) - 5;
				// var _marginTop = parseInt(u.style.height) - (n.logoHeight / 2) - 5;

				// s.rect(_marginLeft,_marginTop,n.logoWidth + 10, n.logoHeight + 10);
				// s.fillStyle = n.logoBackColor;
				// console.log(n.logoWidth);
				// s.fill();
				if(n.logo){
					var _logoLeft = (n.width - n.logoWidth) / 2;
					var _logoTop = (n.height - n.logoHeight) / 2;
					var img = new Image();
					img.onload = function() {
						s.drawImage(img, _logoLeft, _logoTop, n.logoWidth, n.logoHeight);
						n.complete.apply(u, []);
					}
					img.src = n.logo;
				}else{
					n.complete.apply(u, []);
				};
			} else {
				y = new d(n.typeNumber, n.correctLevel);
				y.addData(n.text);
				y.make();
				u = a("<table></table>").css("width", n.width + "px").css("height", n.height + "px").css("border", "0px").css("border-collapse", "collapse").css("background-color", n.background);
				if(n.borderWidth){
					u.css({'border': n.borderWidth +'px '+ n.borderColor +' solid'});
					//u.css({'border-collapse': 'separate'});
				}
				s = n.width / y.getModuleCount();
				x = n.height / y.getModuleCount();
				for (q = 0; q < y.getModuleCount(); q++) {
					p = a("<tr></tr>").css("height", x + "px").appendTo(u);
					for (m = 0; m < y.getModuleCount(); m++) {
						a("<td></td>").css("width", s + "px").css("background-color", y.isDark(q, m) ? n.foreground :n.background).appendTo(p);
					}
				}
			}
			y = u;
			$(y).appendTo(this);
		});
	};
})($);
