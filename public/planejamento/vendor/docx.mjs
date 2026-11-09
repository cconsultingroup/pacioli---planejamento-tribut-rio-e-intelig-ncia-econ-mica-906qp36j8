var Qn = (t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports)
var rl = Qn((Kr) => {
  'use strict'
  Kr.byteLength = op
  Kr.toByteArray = up
  Kr.fromByteArray = hp
  var nt = [],
    $e = [],
    sp = typeof Uint8Array < 'u' ? Uint8Array : Array,
    ei = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  for (Bt = 0, el = ei.length; Bt < el; ++Bt) ((nt[Bt] = ei[Bt]), ($e[ei.charCodeAt(Bt)] = Bt))
  var Bt, el
  $e[45] = 62
  $e[95] = 63
  function tl(t) {
    var e = t.length
    if (e % 4 > 0) throw new Error('Invalid string. Length must be a multiple of 4')
    var r = t.indexOf('=')
    r === -1 && (r = e)
    var n = r === e ? 0 : 4 - (r % 4)
    return [r, n]
  }
  function op(t) {
    var e = tl(t),
      r = e[0],
      n = e[1]
    return ((r + n) * 3) / 4 - n
  }
  function ap(t, e, r) {
    return ((e + r) * 3) / 4 - r
  }
  function up(t) {
    var e,
      r = tl(t),
      n = r[0],
      i = r[1],
      s = new sp(ap(t, n, i)),
      a = 0,
      o = i > 0 ? n - 4 : n,
      l
    for (l = 0; l < o; l += 4)
      ((e =
        ($e[t.charCodeAt(l)] << 18) |
        ($e[t.charCodeAt(l + 1)] << 12) |
        ($e[t.charCodeAt(l + 2)] << 6) |
        $e[t.charCodeAt(l + 3)]),
        (s[a++] = (e >> 16) & 255),
        (s[a++] = (e >> 8) & 255),
        (s[a++] = e & 255))
    return (
      i === 2 &&
        ((e = ($e[t.charCodeAt(l)] << 2) | ($e[t.charCodeAt(l + 1)] >> 4)), (s[a++] = e & 255)),
      i === 1 &&
        ((e =
          ($e[t.charCodeAt(l)] << 10) |
          ($e[t.charCodeAt(l + 1)] << 4) |
          ($e[t.charCodeAt(l + 2)] >> 2)),
        (s[a++] = (e >> 8) & 255),
        (s[a++] = e & 255)),
      s
    )
  }
  function cp(t) {
    return nt[(t >> 18) & 63] + nt[(t >> 12) & 63] + nt[(t >> 6) & 63] + nt[t & 63]
  }
  function lp(t, e, r) {
    for (var n, i = [], s = e; s < r; s += 3)
      ((n = ((t[s] << 16) & 16711680) + ((t[s + 1] << 8) & 65280) + (t[s + 2] & 255)),
        i.push(cp(n)))
    return i.join('')
  }
  function hp(t) {
    for (var e, r = t.length, n = r % 3, i = [], s = 16383, a = 0, o = r - n; a < o; a += s)
      i.push(lp(t, a, a + s > o ? o : a + s))
    return (
      n === 1
        ? ((e = t[r - 1]), i.push(nt[e >> 2] + nt[(e << 4) & 63] + '=='))
        : n === 2 &&
          ((e = (t[r - 2] << 8) + t[r - 1]),
          i.push(nt[e >> 10] + nt[(e >> 4) & 63] + nt[(e << 2) & 63] + '=')),
      i.join('')
    )
  }
})
var nl = Qn((ti) => {
  ti.read = function (t, e, r, n, i) {
    var s,
      a,
      o = i * 8 - n - 1,
      l = (1 << o) - 1,
      p = l >> 1,
      g = -7,
      v = r ? i - 1 : 0,
      E = r ? -1 : 1,
      d = t[e + v]
    for (
      v += E, s = d & ((1 << -g) - 1), d >>= -g, g += o;
      g > 0;
      s = s * 256 + t[e + v], v += E, g -= 8
    );
    for (a = s & ((1 << -g) - 1), s >>= -g, g += n; g > 0; a = a * 256 + t[e + v], v += E, g -= 8);
    if (s === 0) s = 1 - p
    else {
      if (s === l) return a ? NaN : (d ? -1 : 1) * (1 / 0)
      ;((a = a + Math.pow(2, n)), (s = s - p))
    }
    return (d ? -1 : 1) * a * Math.pow(2, s - n)
  }
  ti.write = function (t, e, r, n, i, s) {
    var a,
      o,
      l,
      p = s * 8 - i - 1,
      g = (1 << p) - 1,
      v = g >> 1,
      E = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
      d = n ? 0 : s - 1,
      x = n ? 1 : -1,
      b = e < 0 || (e === 0 && 1 / e < 0) ? 1 : 0
    for (
      e = Math.abs(e),
        isNaN(e) || e === 1 / 0
          ? ((o = isNaN(e) ? 1 : 0), (a = g))
          : ((a = Math.floor(Math.log(e) / Math.LN2)),
            e * (l = Math.pow(2, -a)) < 1 && (a--, (l *= 2)),
            a + v >= 1 ? (e += E / l) : (e += E * Math.pow(2, 1 - v)),
            e * l >= 2 && (a++, (l /= 2)),
            a + v >= g
              ? ((o = 0), (a = g))
              : a + v >= 1
                ? ((o = (e * l - 1) * Math.pow(2, i)), (a = a + v))
                : ((o = e * Math.pow(2, v - 1) * Math.pow(2, i)), (a = 0)));
      i >= 8;
      t[r + d] = o & 255, d += x, o /= 256, i -= 8
    );
    for (a = (a << i) | o, p += i; p > 0; t[r + d] = a & 255, d += x, a /= 256, p -= 8);
    t[r + d - x] |= b * 128
  }
})
var wl = Qn((Vt) => {
  'use strict'
  var ri = rl(),
    $t = nl(),
    il =
      typeof Symbol == 'function' && typeof Symbol.for == 'function'
        ? Symbol.for('nodejs.util.inspect.custom')
        : null
  Vt.Buffer = ie
  Vt.SlowBuffer = gp
  Vt.INSPECT_MAX_BYTES = 50
  var $r = 2147483647
  Vt.kMaxLength = $r
  ie.TYPED_ARRAY_SUPPORT = fp()
  !ie.TYPED_ARRAY_SUPPORT &&
    typeof console < 'u' &&
    typeof console.error == 'function' &&
    console.error(
      'This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.',
    )
  function fp() {
    try {
      var t = new Uint8Array(1),
        e = {
          foo: function () {
            return 42
          },
        }
      return (
        Object.setPrototypeOf(e, Uint8Array.prototype), Object.setPrototypeOf(t, e), t.foo() === 42
      )
    } catch {
      return !1
    }
  }
  Object.defineProperty(ie.prototype, 'parent', {
    enumerable: !0,
    get: function () {
      if (ie.isBuffer(this)) return this.buffer
    },
  })
  Object.defineProperty(ie.prototype, 'offset', {
    enumerable: !0,
    get: function () {
      if (ie.isBuffer(this)) return this.byteOffset
    },
  })
  function bt(t) {
    if (t > $r) throw new RangeError('The value "' + t + '" is invalid for option "size"')
    var e = new Uint8Array(t)
    return (Object.setPrototypeOf(e, ie.prototype), e)
  }
  function ie(t, e, r) {
    if (typeof t == 'number') {
      if (typeof e == 'string')
        throw new TypeError('The "string" argument must be of type string. Received type number')
      return oi(t)
    }
    return al(t, e, r)
  }
  ie.poolSize = 8192
  function al(t, e, r) {
    if (typeof t == 'string') return pp(t, e)
    if (ArrayBuffer.isView(t)) return mp(t)
    if (t == null)
      throw new TypeError(
        'The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' +
          typeof t,
      )
    if (
      it(t, ArrayBuffer) ||
      (t && it(t.buffer, ArrayBuffer)) ||
      (typeof SharedArrayBuffer < 'u' &&
        (it(t, SharedArrayBuffer) || (t && it(t.buffer, SharedArrayBuffer))))
    )
      return ii(t, e, r)
    if (typeof t == 'number')
      throw new TypeError('The "value" argument must not be of type number. Received type number')
    var n = t.valueOf && t.valueOf()
    if (n != null && n !== t) return ie.from(n, e, r)
    var i = wp(t)
    if (i) return i
    if (
      typeof Symbol < 'u' &&
      Symbol.toPrimitive != null &&
      typeof t[Symbol.toPrimitive] == 'function'
    )
      return ie.from(t[Symbol.toPrimitive]('string'), e, r)
    throw new TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' +
        typeof t,
    )
  }
  ie.from = function (t, e, r) {
    return al(t, e, r)
  }
  Object.setPrototypeOf(ie.prototype, Uint8Array.prototype)
  Object.setPrototypeOf(ie, Uint8Array)
  function ul(t) {
    if (typeof t != 'number') throw new TypeError('"size" argument must be of type number')
    if (t < 0) throw new RangeError('The value "' + t + '" is invalid for option "size"')
  }
  function dp(t, e, r) {
    return (
      ul(t),
      t <= 0
        ? bt(t)
        : e !== void 0
          ? typeof r == 'string'
            ? bt(t).fill(e, r)
            : bt(t).fill(e)
          : bt(t)
    )
  }
  ie.alloc = function (t, e, r) {
    return dp(t, e, r)
  }
  function oi(t) {
    return (ul(t), bt(t < 0 ? 0 : ai(t) | 0))
  }
  ie.allocUnsafe = function (t) {
    return oi(t)
  }
  ie.allocUnsafeSlow = function (t) {
    return oi(t)
  }
  function pp(t, e) {
    if (((typeof e != 'string' || e === '') && (e = 'utf8'), !ie.isEncoding(e)))
      throw new TypeError('Unknown encoding: ' + e)
    var r = cl(t, e) | 0,
      n = bt(r),
      i = n.write(t, e)
    return (i !== r && (n = n.slice(0, i)), n)
  }
  function ni(t) {
    for (var e = t.length < 0 ? 0 : ai(t.length) | 0, r = bt(e), n = 0; n < e; n += 1)
      r[n] = t[n] & 255
    return r
  }
  function mp(t) {
    if (it(t, Uint8Array)) {
      var e = new Uint8Array(t)
      return ii(e.buffer, e.byteOffset, e.byteLength)
    }
    return ni(t)
  }
  function ii(t, e, r) {
    if (e < 0 || t.byteLength < e) throw new RangeError('"offset" is outside of buffer bounds')
    if (t.byteLength < e + (r || 0)) throw new RangeError('"length" is outside of buffer bounds')
    var n
    return (
      e === void 0 && r === void 0
        ? (n = new Uint8Array(t))
        : r === void 0
          ? (n = new Uint8Array(t, e))
          : (n = new Uint8Array(t, e, r)),
      Object.setPrototypeOf(n, ie.prototype),
      n
    )
  }
  function wp(t) {
    if (ie.isBuffer(t)) {
      var e = ai(t.length) | 0,
        r = bt(e)
      return (r.length === 0 || t.copy(r, 0, 0, e), r)
    }
    if (t.length !== void 0) return typeof t.length != 'number' || ui(t.length) ? bt(0) : ni(t)
    if (t.type === 'Buffer' && Array.isArray(t.data)) return ni(t.data)
  }
  function ai(t) {
    if (t >= $r)
      throw new RangeError(
        'Attempt to allocate Buffer larger than maximum size: 0x' + $r.toString(16) + ' bytes',
      )
    return t | 0
  }
  function gp(t) {
    return (+t != t && (t = 0), ie.alloc(+t))
  }
  ie.isBuffer = function (e) {
    return e != null && e._isBuffer === !0 && e !== ie.prototype
  }
  ie.compare = function (e, r) {
    if (
      (it(e, Uint8Array) && (e = ie.from(e, e.offset, e.byteLength)),
      it(r, Uint8Array) && (r = ie.from(r, r.offset, r.byteLength)),
      !ie.isBuffer(e) || !ie.isBuffer(r))
    )
      throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array')
    if (e === r) return 0
    for (var n = e.length, i = r.length, s = 0, a = Math.min(n, i); s < a; ++s)
      if (e[s] !== r[s]) {
        ;((n = e[s]), (i = r[s]))
        break
      }
    return n < i ? -1 : i < n ? 1 : 0
  }
  ie.isEncoding = function (e) {
    switch (String(e).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return !0
      default:
        return !1
    }
  }
  ie.concat = function (e, r) {
    if (!Array.isArray(e)) throw new TypeError('"list" argument must be an Array of Buffers')
    if (e.length === 0) return ie.alloc(0)
    var n
    if (r === void 0) for (r = 0, n = 0; n < e.length; ++n) r += e[n].length
    var i = ie.allocUnsafe(r),
      s = 0
    for (n = 0; n < e.length; ++n) {
      var a = e[n]
      if (it(a, Uint8Array))
        s + a.length > i.length ? ie.from(a).copy(i, s) : Uint8Array.prototype.set.call(i, a, s)
      else if (ie.isBuffer(a)) a.copy(i, s)
      else throw new TypeError('"list" argument must be an Array of Buffers')
      s += a.length
    }
    return i
  }
  function cl(t, e) {
    if (ie.isBuffer(t)) return t.length
    if (ArrayBuffer.isView(t) || it(t, ArrayBuffer)) return t.byteLength
    if (typeof t != 'string')
      throw new TypeError(
        'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' +
          typeof t,
      )
    var r = t.length,
      n = arguments.length > 2 && arguments[2] === !0
    if (!n && r === 0) return 0
    for (var i = !1; ; )
      switch (e) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return r
        case 'utf8':
        case 'utf-8':
          return si(t).length
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return r * 2
        case 'hex':
          return r >>> 1
        case 'base64':
          return ml(t).length
        default:
          if (i) return n ? -1 : si(t).length
          ;((e = ('' + e).toLowerCase()), (i = !0))
      }
  }
  ie.byteLength = cl
  function yp(t, e, r) {
    var n = !1
    if (
      ((e === void 0 || e < 0) && (e = 0),
      e > this.length ||
        ((r === void 0 || r > this.length) && (r = this.length), r <= 0) ||
        ((r >>>= 0), (e >>>= 0), r <= e))
    )
      return ''
    for (t || (t = 'utf8'); ; )
      switch (t) {
        case 'hex':
          return Rp(this, e, r)
        case 'utf8':
        case 'utf-8':
          return hl(this, e, r)
        case 'ascii':
          return Sp(this, e, r)
        case 'latin1':
        case 'binary':
          return Ip(this, e, r)
        case 'base64':
          return Tp(this, e, r)
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return Np(this, e, r)
        default:
          if (n) throw new TypeError('Unknown encoding: ' + t)
          ;((t = (t + '').toLowerCase()), (n = !0))
      }
  }
  ie.prototype._isBuffer = !0
  function Pt(t, e, r) {
    var n = t[e]
    ;((t[e] = t[r]), (t[r] = n))
  }
  ie.prototype.swap16 = function () {
    var e = this.length
    if (e % 2 !== 0) throw new RangeError('Buffer size must be a multiple of 16-bits')
    for (var r = 0; r < e; r += 2) Pt(this, r, r + 1)
    return this
  }
  ie.prototype.swap32 = function () {
    var e = this.length
    if (e % 4 !== 0) throw new RangeError('Buffer size must be a multiple of 32-bits')
    for (var r = 0; r < e; r += 4) (Pt(this, r, r + 3), Pt(this, r + 1, r + 2))
    return this
  }
  ie.prototype.swap64 = function () {
    var e = this.length
    if (e % 8 !== 0) throw new RangeError('Buffer size must be a multiple of 64-bits')
    for (var r = 0; r < e; r += 8)
      (Pt(this, r, r + 7), Pt(this, r + 1, r + 6), Pt(this, r + 2, r + 5), Pt(this, r + 3, r + 4))
    return this
  }
  ie.prototype.toString = function () {
    var e = this.length
    return e === 0 ? '' : arguments.length === 0 ? hl(this, 0, e) : yp.apply(this, arguments)
  }
  ie.prototype.toLocaleString = ie.prototype.toString
  ie.prototype.equals = function (e) {
    if (!ie.isBuffer(e)) throw new TypeError('Argument must be a Buffer')
    return this === e ? !0 : ie.compare(this, e) === 0
  }
  ie.prototype.inspect = function () {
    var e = '',
      r = Vt.INSPECT_MAX_BYTES
    return (
      (e = this.toString('hex', 0, r)
        .replace(/(.{2})/g, '$1 ')
        .trim()),
      this.length > r && (e += ' ... '),
      '<Buffer ' + e + '>'
    )
  }
  il && (ie.prototype[il] = ie.prototype.inspect)
  ie.prototype.compare = function (e, r, n, i, s) {
    if ((it(e, Uint8Array) && (e = ie.from(e, e.offset, e.byteLength)), !ie.isBuffer(e)))
      throw new TypeError(
        'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e,
      )
    if (
      (r === void 0 && (r = 0),
      n === void 0 && (n = e ? e.length : 0),
      i === void 0 && (i = 0),
      s === void 0 && (s = this.length),
      r < 0 || n > e.length || i < 0 || s > this.length)
    )
      throw new RangeError('out of range index')
    if (i >= s && r >= n) return 0
    if (i >= s) return -1
    if (r >= n) return 1
    if (((r >>>= 0), (n >>>= 0), (i >>>= 0), (s >>>= 0), this === e)) return 0
    for (
      var a = s - i, o = n - r, l = Math.min(a, o), p = this.slice(i, s), g = e.slice(r, n), v = 0;
      v < l;
      ++v
    )
      if (p[v] !== g[v]) {
        ;((a = p[v]), (o = g[v]))
        break
      }
    return a < o ? -1 : o < a ? 1 : 0
  }
  function ll(t, e, r, n, i) {
    if (t.length === 0) return -1
    if (
      (typeof r == 'string'
        ? ((n = r), (r = 0))
        : r > 2147483647
          ? (r = 2147483647)
          : r < -2147483648 && (r = -2147483648),
      (r = +r),
      ui(r) && (r = i ? 0 : t.length - 1),
      r < 0 && (r = t.length + r),
      r >= t.length)
    ) {
      if (i) return -1
      r = t.length - 1
    } else if (r < 0)
      if (i) r = 0
      else return -1
    if ((typeof e == 'string' && (e = ie.from(e, n)), ie.isBuffer(e)))
      return e.length === 0 ? -1 : sl(t, e, r, n, i)
    if (typeof e == 'number')
      return (
        (e = e & 255),
        typeof Uint8Array.prototype.indexOf == 'function'
          ? i
            ? Uint8Array.prototype.indexOf.call(t, e, r)
            : Uint8Array.prototype.lastIndexOf.call(t, e, r)
          : sl(t, [e], r, n, i)
      )
    throw new TypeError('val must be string, number or Buffer')
  }
  function sl(t, e, r, n, i) {
    var s = 1,
      a = t.length,
      o = e.length
    if (
      n !== void 0 &&
      ((n = String(n).toLowerCase()),
      n === 'ucs2' || n === 'ucs-2' || n === 'utf16le' || n === 'utf-16le')
    ) {
      if (t.length < 2 || e.length < 2) return -1
      ;((s = 2), (a /= 2), (o /= 2), (r /= 2))
    }
    function l(d, x) {
      return s === 1 ? d[x] : d.readUInt16BE(x * s)
    }
    var p
    if (i) {
      var g = -1
      for (p = r; p < a; p++)
        if (l(t, p) === l(e, g === -1 ? 0 : p - g)) {
          if ((g === -1 && (g = p), p - g + 1 === o)) return g * s
        } else (g !== -1 && (p -= p - g), (g = -1))
    } else
      for (r + o > a && (r = a - o), p = r; p >= 0; p--) {
        for (var v = !0, E = 0; E < o; E++)
          if (l(t, p + E) !== l(e, E)) {
            v = !1
            break
          }
        if (v) return p
      }
    return -1
  }
  ie.prototype.includes = function (e, r, n) {
    return this.indexOf(e, r, n) !== -1
  }
  ie.prototype.indexOf = function (e, r, n) {
    return ll(this, e, r, n, !0)
  }
  ie.prototype.lastIndexOf = function (e, r, n) {
    return ll(this, e, r, n, !1)
  }
  function vp(t, e, r, n) {
    r = Number(r) || 0
    var i = t.length - r
    n ? ((n = Number(n)), n > i && (n = i)) : (n = i)
    var s = e.length
    n > s / 2 && (n = s / 2)
    for (var a = 0; a < n; ++a) {
      var o = parseInt(e.substr(a * 2, 2), 16)
      if (ui(o)) return a
      t[r + a] = o
    }
    return a
  }
  function _p(t, e, r, n) {
    return Vr(si(e, t.length - r), t, r, n)
  }
  function bp(t, e, r, n) {
    return Vr(Op(e), t, r, n)
  }
  function Ep(t, e, r, n) {
    return Vr(ml(e), t, r, n)
  }
  function xp(t, e, r, n) {
    return Vr(Dp(e, t.length - r), t, r, n)
  }
  ie.prototype.write = function (e, r, n, i) {
    if (r === void 0) ((i = 'utf8'), (n = this.length), (r = 0))
    else if (n === void 0 && typeof r == 'string') ((i = r), (n = this.length), (r = 0))
    else if (isFinite(r))
      ((r = r >>> 0),
        isFinite(n) ? ((n = n >>> 0), i === void 0 && (i = 'utf8')) : ((i = n), (n = void 0)))
    else throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported')
    var s = this.length - r
    if (((n === void 0 || n > s) && (n = s), (e.length > 0 && (n < 0 || r < 0)) || r > this.length))
      throw new RangeError('Attempt to write outside buffer bounds')
    i || (i = 'utf8')
    for (var a = !1; ; )
      switch (i) {
        case 'hex':
          return vp(this, e, r, n)
        case 'utf8':
        case 'utf-8':
          return _p(this, e, r, n)
        case 'ascii':
        case 'latin1':
        case 'binary':
          return bp(this, e, r, n)
        case 'base64':
          return Ep(this, e, r, n)
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return xp(this, e, r, n)
        default:
          if (a) throw new TypeError('Unknown encoding: ' + i)
          ;((i = ('' + i).toLowerCase()), (a = !0))
      }
  }
  ie.prototype.toJSON = function () {
    return { type: 'Buffer', data: Array.prototype.slice.call(this._arr || this, 0) }
  }
  function Tp(t, e, r) {
    return e === 0 && r === t.length ? ri.fromByteArray(t) : ri.fromByteArray(t.slice(e, r))
  }
  function hl(t, e, r) {
    r = Math.min(t.length, r)
    for (var n = [], i = e; i < r; ) {
      var s = t[i],
        a = null,
        o = s > 239 ? 4 : s > 223 ? 3 : s > 191 ? 2 : 1
      if (i + o <= r) {
        var l, p, g, v
        switch (o) {
          case 1:
            s < 128 && (a = s)
            break
          case 2:
            ;((l = t[i + 1]),
              (l & 192) === 128 && ((v = ((s & 31) << 6) | (l & 63)), v > 127 && (a = v)))
            break
          case 3:
            ;((l = t[i + 1]),
              (p = t[i + 2]),
              (l & 192) === 128 &&
                (p & 192) === 128 &&
                ((v = ((s & 15) << 12) | ((l & 63) << 6) | (p & 63)),
                v > 2047 && (v < 55296 || v > 57343) && (a = v)))
            break
          case 4:
            ;((l = t[i + 1]),
              (p = t[i + 2]),
              (g = t[i + 3]),
              (l & 192) === 128 &&
                (p & 192) === 128 &&
                (g & 192) === 128 &&
                ((v = ((s & 15) << 18) | ((l & 63) << 12) | ((p & 63) << 6) | (g & 63)),
                v > 65535 && v < 1114112 && (a = v)))
        }
      }
      ;(a === null
        ? ((a = 65533), (o = 1))
        : a > 65535 &&
          ((a -= 65536), n.push(((a >>> 10) & 1023) | 55296), (a = 56320 | (a & 1023))),
        n.push(a),
        (i += o))
    }
    return Ap(n)
  }
  var ol = 4096
  function Ap(t) {
    var e = t.length
    if (e <= ol) return String.fromCharCode.apply(String, t)
    for (var r = '', n = 0; n < e; ) r += String.fromCharCode.apply(String, t.slice(n, (n += ol)))
    return r
  }
  function Sp(t, e, r) {
    var n = ''
    r = Math.min(t.length, r)
    for (var i = e; i < r; ++i) n += String.fromCharCode(t[i] & 127)
    return n
  }
  function Ip(t, e, r) {
    var n = ''
    r = Math.min(t.length, r)
    for (var i = e; i < r; ++i) n += String.fromCharCode(t[i])
    return n
  }
  function Rp(t, e, r) {
    var n = t.length
    ;((!e || e < 0) && (e = 0), (!r || r < 0 || r > n) && (r = n))
    for (var i = '', s = e; s < r; ++s) i += Fp[t[s]]
    return i
  }
  function Np(t, e, r) {
    for (var n = t.slice(e, r), i = '', s = 0; s < n.length - 1; s += 2)
      i += String.fromCharCode(n[s] + n[s + 1] * 256)
    return i
  }
  ie.prototype.slice = function (e, r) {
    var n = this.length
    ;((e = ~~e),
      (r = r === void 0 ? n : ~~r),
      e < 0 ? ((e += n), e < 0 && (e = 0)) : e > n && (e = n),
      r < 0 ? ((r += n), r < 0 && (r = 0)) : r > n && (r = n),
      r < e && (r = e))
    var i = this.subarray(e, r)
    return (Object.setPrototypeOf(i, ie.prototype), i)
  }
  function Oe(t, e, r) {
    if (t % 1 !== 0 || t < 0) throw new RangeError('offset is not uint')
    if (t + e > r) throw new RangeError('Trying to access beyond buffer length')
  }
  ie.prototype.readUintLE = ie.prototype.readUIntLE = function (e, r, n) {
    ;((e = e >>> 0), (r = r >>> 0), n || Oe(e, r, this.length))
    for (var i = this[e], s = 1, a = 0; ++a < r && (s *= 256); ) i += this[e + a] * s
    return i
  }
  ie.prototype.readUintBE = ie.prototype.readUIntBE = function (e, r, n) {
    ;((e = e >>> 0), (r = r >>> 0), n || Oe(e, r, this.length))
    for (var i = this[e + --r], s = 1; r > 0 && (s *= 256); ) i += this[e + --r] * s
    return i
  }
  ie.prototype.readUint8 = ie.prototype.readUInt8 = function (e, r) {
    return ((e = e >>> 0), r || Oe(e, 1, this.length), this[e])
  }
  ie.prototype.readUint16LE = ie.prototype.readUInt16LE = function (e, r) {
    return ((e = e >>> 0), r || Oe(e, 2, this.length), this[e] | (this[e + 1] << 8))
  }
  ie.prototype.readUint16BE = ie.prototype.readUInt16BE = function (e, r) {
    return ((e = e >>> 0), r || Oe(e, 2, this.length), (this[e] << 8) | this[e + 1])
  }
  ie.prototype.readUint32LE = ie.prototype.readUInt32LE = function (e, r) {
    return (
      (e = e >>> 0),
      r || Oe(e, 4, this.length),
      (this[e] | (this[e + 1] << 8) | (this[e + 2] << 16)) + this[e + 3] * 16777216
    )
  }
  ie.prototype.readUint32BE = ie.prototype.readUInt32BE = function (e, r) {
    return (
      (e = e >>> 0),
      r || Oe(e, 4, this.length),
      this[e] * 16777216 + ((this[e + 1] << 16) | (this[e + 2] << 8) | this[e + 3])
    )
  }
  ie.prototype.readIntLE = function (e, r, n) {
    ;((e = e >>> 0), (r = r >>> 0), n || Oe(e, r, this.length))
    for (var i = this[e], s = 1, a = 0; ++a < r && (s *= 256); ) i += this[e + a] * s
    return ((s *= 128), i >= s && (i -= Math.pow(2, 8 * r)), i)
  }
  ie.prototype.readIntBE = function (e, r, n) {
    ;((e = e >>> 0), (r = r >>> 0), n || Oe(e, r, this.length))
    for (var i = r, s = 1, a = this[e + --i]; i > 0 && (s *= 256); ) a += this[e + --i] * s
    return ((s *= 128), a >= s && (a -= Math.pow(2, 8 * r)), a)
  }
  ie.prototype.readInt8 = function (e, r) {
    return (
      (e = e >>> 0), r || Oe(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e]
    )
  }
  ie.prototype.readInt16LE = function (e, r) {
    ;((e = e >>> 0), r || Oe(e, 2, this.length))
    var n = this[e] | (this[e + 1] << 8)
    return n & 32768 ? n | 4294901760 : n
  }
  ie.prototype.readInt16BE = function (e, r) {
    ;((e = e >>> 0), r || Oe(e, 2, this.length))
    var n = this[e + 1] | (this[e] << 8)
    return n & 32768 ? n | 4294901760 : n
  }
  ie.prototype.readInt32LE = function (e, r) {
    return (
      (e = e >>> 0),
      r || Oe(e, 4, this.length),
      this[e] | (this[e + 1] << 8) | (this[e + 2] << 16) | (this[e + 3] << 24)
    )
  }
  ie.prototype.readInt32BE = function (e, r) {
    return (
      (e = e >>> 0),
      r || Oe(e, 4, this.length),
      (this[e] << 24) | (this[e + 1] << 16) | (this[e + 2] << 8) | this[e + 3]
    )
  }
  ie.prototype.readFloatLE = function (e, r) {
    return ((e = e >>> 0), r || Oe(e, 4, this.length), $t.read(this, e, !0, 23, 4))
  }
  ie.prototype.readFloatBE = function (e, r) {
    return ((e = e >>> 0), r || Oe(e, 4, this.length), $t.read(this, e, !1, 23, 4))
  }
  ie.prototype.readDoubleLE = function (e, r) {
    return ((e = e >>> 0), r || Oe(e, 8, this.length), $t.read(this, e, !0, 52, 8))
  }
  ie.prototype.readDoubleBE = function (e, r) {
    return ((e = e >>> 0), r || Oe(e, 8, this.length), $t.read(this, e, !1, 52, 8))
  }
  function We(t, e, r, n, i, s) {
    if (!ie.isBuffer(t)) throw new TypeError('"buffer" argument must be a Buffer instance')
    if (e > i || e < s) throw new RangeError('"value" argument is out of bounds')
    if (r + n > t.length) throw new RangeError('Index out of range')
  }
  ie.prototype.writeUintLE = ie.prototype.writeUIntLE = function (e, r, n, i) {
    if (((e = +e), (r = r >>> 0), (n = n >>> 0), !i)) {
      var s = Math.pow(2, 8 * n) - 1
      We(this, e, r, n, s, 0)
    }
    var a = 1,
      o = 0
    for (this[r] = e & 255; ++o < n && (a *= 256); ) this[r + o] = (e / a) & 255
    return r + n
  }
  ie.prototype.writeUintBE = ie.prototype.writeUIntBE = function (e, r, n, i) {
    if (((e = +e), (r = r >>> 0), (n = n >>> 0), !i)) {
      var s = Math.pow(2, 8 * n) - 1
      We(this, e, r, n, s, 0)
    }
    var a = n - 1,
      o = 1
    for (this[r + a] = e & 255; --a >= 0 && (o *= 256); ) this[r + a] = (e / o) & 255
    return r + n
  }
  ie.prototype.writeUint8 = ie.prototype.writeUInt8 = function (e, r, n) {
    return ((e = +e), (r = r >>> 0), n || We(this, e, r, 1, 255, 0), (this[r] = e & 255), r + 1)
  }
  ie.prototype.writeUint16LE = ie.prototype.writeUInt16LE = function (e, r, n) {
    return (
      (e = +e),
      (r = r >>> 0),
      n || We(this, e, r, 2, 65535, 0),
      (this[r] = e & 255),
      (this[r + 1] = e >>> 8),
      r + 2
    )
  }
  ie.prototype.writeUint16BE = ie.prototype.writeUInt16BE = function (e, r, n) {
    return (
      (e = +e),
      (r = r >>> 0),
      n || We(this, e, r, 2, 65535, 0),
      (this[r] = e >>> 8),
      (this[r + 1] = e & 255),
      r + 2
    )
  }
  ie.prototype.writeUint32LE = ie.prototype.writeUInt32LE = function (e, r, n) {
    return (
      (e = +e),
      (r = r >>> 0),
      n || We(this, e, r, 4, 4294967295, 0),
      (this[r + 3] = e >>> 24),
      (this[r + 2] = e >>> 16),
      (this[r + 1] = e >>> 8),
      (this[r] = e & 255),
      r + 4
    )
  }
  ie.prototype.writeUint32BE = ie.prototype.writeUInt32BE = function (e, r, n) {
    return (
      (e = +e),
      (r = r >>> 0),
      n || We(this, e, r, 4, 4294967295, 0),
      (this[r] = e >>> 24),
      (this[r + 1] = e >>> 16),
      (this[r + 2] = e >>> 8),
      (this[r + 3] = e & 255),
      r + 4
    )
  }
  ie.prototype.writeIntLE = function (e, r, n, i) {
    if (((e = +e), (r = r >>> 0), !i)) {
      var s = Math.pow(2, 8 * n - 1)
      We(this, e, r, n, s - 1, -s)
    }
    var a = 0,
      o = 1,
      l = 0
    for (this[r] = e & 255; ++a < n && (o *= 256); )
      (e < 0 && l === 0 && this[r + a - 1] !== 0 && (l = 1),
        (this[r + a] = (((e / o) >> 0) - l) & 255))
    return r + n
  }
  ie.prototype.writeIntBE = function (e, r, n, i) {
    if (((e = +e), (r = r >>> 0), !i)) {
      var s = Math.pow(2, 8 * n - 1)
      We(this, e, r, n, s - 1, -s)
    }
    var a = n - 1,
      o = 1,
      l = 0
    for (this[r + a] = e & 255; --a >= 0 && (o *= 256); )
      (e < 0 && l === 0 && this[r + a + 1] !== 0 && (l = 1),
        (this[r + a] = (((e / o) >> 0) - l) & 255))
    return r + n
  }
  ie.prototype.writeInt8 = function (e, r, n) {
    return (
      (e = +e),
      (r = r >>> 0),
      n || We(this, e, r, 1, 127, -128),
      e < 0 && (e = 255 + e + 1),
      (this[r] = e & 255),
      r + 1
    )
  }
  ie.prototype.writeInt16LE = function (e, r, n) {
    return (
      (e = +e),
      (r = r >>> 0),
      n || We(this, e, r, 2, 32767, -32768),
      (this[r] = e & 255),
      (this[r + 1] = e >>> 8),
      r + 2
    )
  }
  ie.prototype.writeInt16BE = function (e, r, n) {
    return (
      (e = +e),
      (r = r >>> 0),
      n || We(this, e, r, 2, 32767, -32768),
      (this[r] = e >>> 8),
      (this[r + 1] = e & 255),
      r + 2
    )
  }
  ie.prototype.writeInt32LE = function (e, r, n) {
    return (
      (e = +e),
      (r = r >>> 0),
      n || We(this, e, r, 4, 2147483647, -2147483648),
      (this[r] = e & 255),
      (this[r + 1] = e >>> 8),
      (this[r + 2] = e >>> 16),
      (this[r + 3] = e >>> 24),
      r + 4
    )
  }
  ie.prototype.writeInt32BE = function (e, r, n) {
    return (
      (e = +e),
      (r = r >>> 0),
      n || We(this, e, r, 4, 2147483647, -2147483648),
      e < 0 && (e = 4294967295 + e + 1),
      (this[r] = e >>> 24),
      (this[r + 1] = e >>> 16),
      (this[r + 2] = e >>> 8),
      (this[r + 3] = e & 255),
      r + 4
    )
  }
  function fl(t, e, r, n, i, s) {
    if (r + n > t.length) throw new RangeError('Index out of range')
    if (r < 0) throw new RangeError('Index out of range')
  }
  function dl(t, e, r, n, i) {
    return (
      (e = +e),
      (r = r >>> 0),
      i || fl(t, e, r, 4, 34028234663852886e22, -34028234663852886e22),
      $t.write(t, e, r, n, 23, 4),
      r + 4
    )
  }
  ie.prototype.writeFloatLE = function (e, r, n) {
    return dl(this, e, r, !0, n)
  }
  ie.prototype.writeFloatBE = function (e, r, n) {
    return dl(this, e, r, !1, n)
  }
  function pl(t, e, r, n, i) {
    return (
      (e = +e),
      (r = r >>> 0),
      i || fl(t, e, r, 8, 17976931348623157e292, -17976931348623157e292),
      $t.write(t, e, r, n, 52, 8),
      r + 8
    )
  }
  ie.prototype.writeDoubleLE = function (e, r, n) {
    return pl(this, e, r, !0, n)
  }
  ie.prototype.writeDoubleBE = function (e, r, n) {
    return pl(this, e, r, !1, n)
  }
  ie.prototype.copy = function (e, r, n, i) {
    if (!ie.isBuffer(e)) throw new TypeError('argument should be a Buffer')
    if (
      (n || (n = 0),
      !i && i !== 0 && (i = this.length),
      r >= e.length && (r = e.length),
      r || (r = 0),
      i > 0 && i < n && (i = n),
      i === n || e.length === 0 || this.length === 0)
    )
      return 0
    if (r < 0) throw new RangeError('targetStart out of bounds')
    if (n < 0 || n >= this.length) throw new RangeError('Index out of range')
    if (i < 0) throw new RangeError('sourceEnd out of bounds')
    ;(i > this.length && (i = this.length), e.length - r < i - n && (i = e.length - r + n))
    var s = i - n
    return (
      this === e && typeof Uint8Array.prototype.copyWithin == 'function'
        ? this.copyWithin(r, n, i)
        : Uint8Array.prototype.set.call(e, this.subarray(n, i), r),
      s
    )
  }
  ie.prototype.fill = function (e, r, n, i) {
    if (typeof e == 'string') {
      if (
        (typeof r == 'string'
          ? ((i = r), (r = 0), (n = this.length))
          : typeof n == 'string' && ((i = n), (n = this.length)),
        i !== void 0 && typeof i != 'string')
      )
        throw new TypeError('encoding must be a string')
      if (typeof i == 'string' && !ie.isEncoding(i)) throw new TypeError('Unknown encoding: ' + i)
      if (e.length === 1) {
        var s = e.charCodeAt(0)
        ;((i === 'utf8' && s < 128) || i === 'latin1') && (e = s)
      }
    } else typeof e == 'number' ? (e = e & 255) : typeof e == 'boolean' && (e = Number(e))
    if (r < 0 || this.length < r || this.length < n) throw new RangeError('Out of range index')
    if (n <= r) return this
    ;((r = r >>> 0), (n = n === void 0 ? this.length : n >>> 0), e || (e = 0))
    var a
    if (typeof e == 'number') for (a = r; a < n; ++a) this[a] = e
    else {
      var o = ie.isBuffer(e) ? e : ie.from(e, i),
        l = o.length
      if (l === 0) throw new TypeError('The value "' + e + '" is invalid for argument "value"')
      for (a = 0; a < n - r; ++a) this[a + r] = o[a % l]
    }
    return this
  }
  var kp = /[^+/0-9A-Za-z-_]/g
  function Cp(t) {
    if (((t = t.split('=')[0]), (t = t.trim().replace(kp, '')), t.length < 2)) return ''
    for (; t.length % 4 !== 0; ) t = t + '='
    return t
  }
  function si(t, e) {
    e = e || 1 / 0
    for (var r, n = t.length, i = null, s = [], a = 0; a < n; ++a) {
      if (((r = t.charCodeAt(a)), r > 55295 && r < 57344)) {
        if (!i) {
          if (r > 56319) {
            ;(e -= 3) > -1 && s.push(239, 191, 189)
            continue
          } else if (a + 1 === n) {
            ;(e -= 3) > -1 && s.push(239, 191, 189)
            continue
          }
          i = r
          continue
        }
        if (r < 56320) {
          ;((e -= 3) > -1 && s.push(239, 191, 189), (i = r))
          continue
        }
        r = (((i - 55296) << 10) | (r - 56320)) + 65536
      } else i && (e -= 3) > -1 && s.push(239, 191, 189)
      if (((i = null), r < 128)) {
        if ((e -= 1) < 0) break
        s.push(r)
      } else if (r < 2048) {
        if ((e -= 2) < 0) break
        s.push((r >> 6) | 192, (r & 63) | 128)
      } else if (r < 65536) {
        if ((e -= 3) < 0) break
        s.push((r >> 12) | 224, ((r >> 6) & 63) | 128, (r & 63) | 128)
      } else if (r < 1114112) {
        if ((e -= 4) < 0) break
        s.push((r >> 18) | 240, ((r >> 12) & 63) | 128, ((r >> 6) & 63) | 128, (r & 63) | 128)
      } else throw new Error('Invalid code point')
    }
    return s
  }
  function Op(t) {
    for (var e = [], r = 0; r < t.length; ++r) e.push(t.charCodeAt(r) & 255)
    return e
  }
  function Dp(t, e) {
    for (var r, n, i, s = [], a = 0; a < t.length && !((e -= 2) < 0); ++a)
      ((r = t.charCodeAt(a)), (n = r >> 8), (i = r % 256), s.push(i), s.push(n))
    return s
  }
  function ml(t) {
    return ri.toByteArray(Cp(t))
  }
  function Vr(t, e, r, n) {
    for (var i = 0; i < n && !(i + r >= e.length || i >= t.length); ++i) e[i + r] = t[i]
    return i
  }
  function it(t, e) {
    return (
      t instanceof e ||
      (t != null &&
        t.constructor != null &&
        t.constructor.name != null &&
        t.constructor.name === e.name)
    )
  }
  function ui(t) {
    return t !== t
  }
  var Fp = (function () {
    for (var t = '0123456789abcdef', e = new Array(256), r = 0; r < 16; ++r)
      for (var n = r * 16, i = 0; i < 16; ++i) e[n + i] = t[r] + t[i]
    return e
  })()
})
var Lp = Object.defineProperty,
  Bp = Object.defineProperties,
  Pp = Object.getOwnPropertyDescriptors,
  gl = Object.getOwnPropertySymbols,
  Up = Object.prototype.hasOwnProperty,
  Mp = Object.prototype.propertyIsEnumerable,
  ns = (t, e, r) =>
    e in t ? Lp(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : (t[e] = r),
  ye = (t, e) => {
    for (var r in e || (e = {})) Up.call(e, r) && ns(t, r, e[r])
    if (gl) for (var r of gl(e)) Mp.call(e, r) && ns(t, r, e[r])
    return t
  },
  Ue = (t, e) => Bp(t, Pp(e)),
  $ = (t, e, r) => ns(t, typeof e != 'symbol' ? e + '' : e, r),
  Zt = (t, e, r) =>
    new Promise((n, i) => {
      var s = (l) => {
          try {
            o(r.next(l))
          } catch (p) {
            i(p)
          }
        },
        a = (l) => {
          try {
            o(r.throw(l))
          } catch (p) {
            i(p)
          }
        },
        o = (l) => (l.done ? n(l.value) : Promise.resolve(l.value).then(s, a))
      o((r = r.apply(t, e)).next())
    }),
  rr = class {
    constructor(e) {
      ;($(this, 'rootKey'), (this.rootKey = e))
    }
  },
  Hp = Object.seal({}),
  M = class extends rr {
    constructor(e) {
      ;(super(e), $(this, 'root'), (this.root = new Array()))
    }
    prepForXml(e) {
      var r
      e.stack.push(this)
      let n = this.root
        .map((i) => (i instanceof rr ? i.prepForXml(e) : i))
        .filter((i) => i !== void 0)
      return (
        e.stack.pop(),
        {
          [this.rootKey]: n.length
            ? n.length === 1 && (r = n[0]) != null && r._attr
              ? n[0]
              : n
            : Hp,
        }
      )
    }
    addChildElement(e) {
      return (this.root.push(e), this)
    }
  },
  et = class extends M {
    prepForXml(e) {
      let r = super.prepForXml(e)
      if (r && (typeof r[this.rootKey] != 'object' || Object.keys(r[this.rootKey]).length)) return r
    }
  },
  ce = class extends rr {
    constructor(e) {
      ;(super('_attr'), $(this, 'xmlKeys'), (this.root = e))
    }
    prepForXml(e) {
      let r = {}
      return (
        Object.entries(this.root).forEach(([n, i]) => {
          if (i !== void 0) {
            let s = (this.xmlKeys && this.xmlKeys[n]) || n
            r[s] = i
          }
        }),
        { _attr: r }
      )
    }
  },
  Ge = class extends rr {
    constructor(e) {
      ;(super('_attr'), (this.root = e))
    }
    prepForXml(e) {
      return {
        _attr: Object.values(this.root)
          .filter(({ value: n }) => n !== void 0)
          .reduce((n, { key: i, value: s }) => Ue(ye({}, n), { [i]: s }), {}),
      }
    }
  },
  Ae = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          val: 'w:val',
          color: 'w:color',
          fill: 'w:fill',
          space: 'w:space',
          sz: 'w:sz',
          type: 'w:type',
          rsidR: 'w:rsidR',
          rsidRPr: 'w:rsidRPr',
          rsidSect: 'w:rsidSect',
          w: 'w:w',
          h: 'w:h',
          top: 'w:top',
          right: 'w:right',
          bottom: 'w:bottom',
          left: 'w:left',
          header: 'w:header',
          footer: 'w:footer',
          gutter: 'w:gutter',
          linePitch: 'w:linePitch',
          pos: 'w:pos',
        }))
    }
  },
  ct =
    typeof globalThis < 'u'
      ? globalThis
      : typeof window < 'u'
        ? window
        : typeof global < 'u'
          ? global
          : typeof self < 'u'
            ? self
            : {}
function Fc(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, 'default') ? t.default : t
}
var Lf = {},
  Lc = { exports: {} },
  Jt = typeof Reflect == 'object' ? Reflect : null,
  yl =
    Jt && typeof Jt.apply == 'function'
      ? Jt.apply
      : function (e, r, n) {
          return Function.prototype.apply.call(e, r, n)
        },
  tn
Jt && typeof Jt.ownKeys == 'function'
  ? (tn = Jt.ownKeys)
  : Object.getOwnPropertySymbols
    ? (tn = function (e) {
        return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))
      })
    : (tn = function (e) {
        return Object.getOwnPropertyNames(e)
      })
function Wp(t) {
  console && console.warn && console.warn(t)
}
var Bf =
  Number.isNaN ||
  function (e) {
    return e !== e
  }
function Te() {
  Te.init.call(this)
}
Lc.exports = Te
Lc.exports.once = Kp
Te.EventEmitter = Te
Te.prototype._events = void 0
Te.prototype._eventsCount = 0
Te.prototype._maxListeners = void 0
var vl = 10
function zn(t) {
  if (typeof t != 'function')
    throw new TypeError(
      'The "listener" argument must be of type Function. Received type ' + typeof t,
    )
}
Object.defineProperty(Te, 'defaultMaxListeners', {
  enumerable: !0,
  get: function () {
    return vl
  },
  set: function (t) {
    if (typeof t != 'number' || t < 0 || Bf(t))
      throw new RangeError(
        'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
          t +
          '.',
      )
    vl = t
  },
})
Te.init = function () {
  ;((this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) &&
    ((this._events = Object.create(null)), (this._eventsCount = 0)),
    (this._maxListeners = this._maxListeners || void 0))
}
Te.prototype.setMaxListeners = function (e) {
  if (typeof e != 'number' || e < 0 || Bf(e))
    throw new RangeError(
      'The value of "n" is out of range. It must be a non-negative number. Received ' + e + '.',
    )
  return ((this._maxListeners = e), this)
}
function Pf(t) {
  return t._maxListeners === void 0 ? Te.defaultMaxListeners : t._maxListeners
}
Te.prototype.getMaxListeners = function () {
  return Pf(this)
}
Te.prototype.emit = function (e) {
  for (var r = [], n = 1; n < arguments.length; n++) r.push(arguments[n])
  var i = e === 'error',
    s = this._events
  if (s !== void 0) i = i && s.error === void 0
  else if (!i) return !1
  if (i) {
    var a
    if ((r.length > 0 && (a = r[0]), a instanceof Error)) throw a
    var o = new Error('Unhandled error.' + (a ? ' (' + a.message + ')' : ''))
    throw ((o.context = a), o)
  }
  var l = s[e]
  if (l === void 0) return !1
  if (typeof l == 'function') yl(l, this, r)
  else for (var p = l.length, g = zf(l, p), n = 0; n < p; ++n) yl(g[n], this, r)
  return !0
}
function Uf(t, e, r, n) {
  var i, s, a
  if (
    (zn(r),
    (s = t._events),
    s === void 0
      ? ((s = t._events = Object.create(null)), (t._eventsCount = 0))
      : (s.newListener !== void 0 &&
          (t.emit('newListener', e, r.listener ? r.listener : r), (s = t._events)),
        (a = s[e])),
    a === void 0)
  )
    ((a = s[e] = r), ++t._eventsCount)
  else if (
    (typeof a == 'function' ? (a = s[e] = n ? [r, a] : [a, r]) : n ? a.unshift(r) : a.push(r),
    (i = Pf(t)),
    i > 0 && a.length > i && !a.warned)
  ) {
    a.warned = !0
    var o = new Error(
      'Possible EventEmitter memory leak detected. ' +
        a.length +
        ' ' +
        String(e) +
        ' listeners added. Use emitter.setMaxListeners() to increase limit',
    )
    ;((o.name = 'MaxListenersExceededWarning'),
      (o.emitter = t),
      (o.type = e),
      (o.count = a.length),
      Wp(o))
  }
  return t
}
Te.prototype.addListener = function (e, r) {
  return Uf(this, e, r, !1)
}
Te.prototype.on = Te.prototype.addListener
Te.prototype.prependListener = function (e, r) {
  return Uf(this, e, r, !0)
}
function zp() {
  if (!this.fired)
    return (
      this.target.removeListener(this.type, this.wrapFn),
      (this.fired = !0),
      arguments.length === 0
        ? this.listener.call(this.target)
        : this.listener.apply(this.target, arguments)
    )
}
function Mf(t, e, r) {
  var n = { fired: !1, wrapFn: void 0, target: t, type: e, listener: r },
    i = zp.bind(n)
  return ((i.listener = r), (n.wrapFn = i), i)
}
Te.prototype.once = function (e, r) {
  return (zn(r), this.on(e, Mf(this, e, r)), this)
}
Te.prototype.prependOnceListener = function (e, r) {
  return (zn(r), this.prependListener(e, Mf(this, e, r)), this)
}
Te.prototype.removeListener = function (e, r) {
  var n, i, s, a, o
  if ((zn(r), (i = this._events), i === void 0)) return this
  if (((n = i[e]), n === void 0)) return this
  if (n === r || n.listener === r)
    --this._eventsCount === 0
      ? (this._events = Object.create(null))
      : (delete i[e], i.removeListener && this.emit('removeListener', e, n.listener || r))
  else if (typeof n != 'function') {
    for (s = -1, a = n.length - 1; a >= 0; a--)
      if (n[a] === r || n[a].listener === r) {
        ;((o = n[a].listener), (s = a))
        break
      }
    if (s < 0) return this
    ;(s === 0 ? n.shift() : jp(n, s),
      n.length === 1 && (i[e] = n[0]),
      i.removeListener !== void 0 && this.emit('removeListener', e, o || r))
  }
  return this
}
Te.prototype.off = Te.prototype.removeListener
Te.prototype.removeAllListeners = function (e) {
  var r, n, i
  if (((n = this._events), n === void 0)) return this
  if (n.removeListener === void 0)
    return (
      arguments.length === 0
        ? ((this._events = Object.create(null)), (this._eventsCount = 0))
        : n[e] !== void 0 &&
          (--this._eventsCount === 0 ? (this._events = Object.create(null)) : delete n[e]),
      this
    )
  if (arguments.length === 0) {
    var s = Object.keys(n),
      a
    for (i = 0; i < s.length; ++i)
      ((a = s[i]), a !== 'removeListener' && this.removeAllListeners(a))
    return (
      this.removeAllListeners('removeListener'),
      (this._events = Object.create(null)),
      (this._eventsCount = 0),
      this
    )
  }
  if (((r = n[e]), typeof r == 'function')) this.removeListener(e, r)
  else if (r !== void 0) for (i = r.length - 1; i >= 0; i--) this.removeListener(e, r[i])
  return this
}
function Hf(t, e, r) {
  var n = t._events
  if (n === void 0) return []
  var i = n[e]
  return i === void 0
    ? []
    : typeof i == 'function'
      ? r
        ? [i.listener || i]
        : [i]
      : r
        ? Gp(i)
        : zf(i, i.length)
}
Te.prototype.listeners = function (e) {
  return Hf(this, e, !0)
}
Te.prototype.rawListeners = function (e) {
  return Hf(this, e, !1)
}
Te.listenerCount = function (t, e) {
  return typeof t.listenerCount == 'function' ? t.listenerCount(e) : Wf.call(t, e)
}
Te.prototype.listenerCount = Wf
function Wf(t) {
  var e = this._events
  if (e !== void 0) {
    var r = e[t]
    if (typeof r == 'function') return 1
    if (r !== void 0) return r.length
  }
  return 0
}
Te.prototype.eventNames = function () {
  return this._eventsCount > 0 ? tn(this._events) : []
}
function zf(t, e) {
  for (var r = new Array(e), n = 0; n < e; ++n) r[n] = t[n]
  return r
}
function jp(t, e) {
  for (; e + 1 < t.length; e++) t[e] = t[e + 1]
  t.pop()
}
function Gp(t) {
  for (var e = new Array(t.length), r = 0; r < e.length; ++r) e[r] = t[r].listener || t[r]
  return e
}
function Kp(t, e) {
  return new Promise(function (r, n) {
    function i(a) {
      ;(t.removeListener(e, s), n(a))
    }
    function s() {
      ;(typeof t.removeListener == 'function' && t.removeListener('error', i),
        r([].slice.call(arguments)))
    }
    ;(jf(t, e, s, { once: !0 }), e !== 'error' && $p(t, i, { once: !0 }))
  })
}
function $p(t, e, r) {
  typeof t.on == 'function' && jf(t, 'error', e, r)
}
function jf(t, e, r, n) {
  if (typeof t.on == 'function') n.once ? t.once(e, r) : t.on(e, r)
  else if (typeof t.addEventListener == 'function')
    t.addEventListener(e, function i(s) {
      ;(n.once && t.removeEventListener(e, i), r(s))
    })
  else
    throw new TypeError(
      'The "emitter" argument must be of type EventEmitter. Received type ' + typeof t,
    )
}
var Bc = Lc.exports,
  is = { exports: {} }
typeof Object.create == 'function'
  ? (is.exports = function (e, r) {
      r &&
        ((e.super_ = r),
        (e.prototype = Object.create(r.prototype, {
          constructor: { value: e, enumerable: !1, writable: !0, configurable: !0 },
        })))
    })
  : (is.exports = function (e, r) {
      if (r) {
        e.super_ = r
        var n = function () {}
        ;((n.prototype = r.prototype), (e.prototype = new n()), (e.prototype.constructor = e))
      }
    })
var Lt = is.exports
function Vp(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, 'default') ? t.default : t
}
var Gf = { exports: {} },
  Ne = (Gf.exports = {}),
  ot,
  at
function ss() {
  throw new Error('setTimeout has not been defined')
}
function os() {
  throw new Error('clearTimeout has not been defined')
}
;(function () {
  try {
    typeof setTimeout == 'function' ? (ot = setTimeout) : (ot = ss)
  } catch {
    ot = ss
  }
  try {
    typeof clearTimeout == 'function' ? (at = clearTimeout) : (at = os)
  } catch {
    at = os
  }
})()
function Kf(t) {
  if (ot === setTimeout) return setTimeout(t, 0)
  if ((ot === ss || !ot) && setTimeout) return ((ot = setTimeout), setTimeout(t, 0))
  try {
    return ot(t, 0)
  } catch {
    try {
      return ot.call(null, t, 0)
    } catch {
      return ot.call(this, t, 0)
    }
  }
}
function qp(t) {
  if (at === clearTimeout) return clearTimeout(t)
  if ((at === os || !at) && clearTimeout) return ((at = clearTimeout), clearTimeout(t))
  try {
    return at(t)
  } catch {
    try {
      return at.call(null, t)
    } catch {
      return at.call(this, t)
    }
  }
}
var Tt = [],
  Qt = !1,
  Mt,
  rn = -1
function Xp() {
  !Qt || !Mt || ((Qt = !1), Mt.length ? (Tt = Mt.concat(Tt)) : (rn = -1), Tt.length && $f())
}
function $f() {
  if (!Qt) {
    var t = Kf(Xp)
    Qt = !0
    for (var e = Tt.length; e; ) {
      for (Mt = Tt, Tt = []; ++rn < e; ) Mt && Mt[rn].run()
      ;((rn = -1), (e = Tt.length))
    }
    ;((Mt = null), (Qt = !1), qp(t))
  }
}
Ne.nextTick = function (t) {
  var e = new Array(arguments.length - 1)
  if (arguments.length > 1) for (var r = 1; r < arguments.length; r++) e[r - 1] = arguments[r]
  ;(Tt.push(new Vf(t, e)), Tt.length === 1 && !Qt && Kf($f))
}
function Vf(t, e) {
  ;((this.fun = t), (this.array = e))
}
Vf.prototype.run = function () {
  this.fun.apply(null, this.array)
}
Ne.title = 'browser'
Ne.browser = !0
Ne.env = {}
Ne.argv = []
Ne.version = ''
Ne.versions = {}
function kt() {}
Ne.on = kt
Ne.addListener = kt
Ne.once = kt
Ne.off = kt
Ne.removeListener = kt
Ne.removeAllListeners = kt
Ne.emit = kt
Ne.prependListener = kt
Ne.prependOnceListener = kt
Ne.listeners = function (t) {
  return []
}
Ne.binding = function (t) {
  throw new Error('process.binding is not supported')
}
Ne.cwd = function () {
  return '/'
}
Ne.chdir = function (t) {
  throw new Error('process.chdir is not supported')
}
Ne.umask = function () {
  return 0
}
var Yp = Gf.exports,
  _e = Vp(Yp),
  ci,
  _l
function qf() {
  return (_l || ((_l = 1), (ci = Bc.EventEmitter)), ci)
}
var li = {},
  br = {},
  bl
function Zp() {
  if (bl) return br
  ;((bl = 1), (br.byteLength = o), (br.toByteArray = p), (br.fromByteArray = E))
  for (
    var t = [],
      e = [],
      r = typeof Uint8Array < 'u' ? Uint8Array : Array,
      n = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      i = 0,
      s = n.length;
    i < s;
    ++i
  )
    ((t[i] = n[i]), (e[n.charCodeAt(i)] = i))
  ;((e[45] = 62), (e[95] = 63))
  function a(d) {
    var x = d.length
    if (x % 4 > 0) throw new Error('Invalid string. Length must be a multiple of 4')
    var b = d.indexOf('=')
    b === -1 && (b = x)
    var T = b === x ? 0 : 4 - (b % 4)
    return [b, T]
  }
  function o(d) {
    var x = a(d),
      b = x[0],
      T = x[1]
    return ((b + T) * 3) / 4 - T
  }
  function l(d, x, b) {
    return ((x + b) * 3) / 4 - b
  }
  function p(d) {
    var x,
      b = a(d),
      T = b[0],
      m = b[1],
      A = new r(l(d, T, m)),
      I = 0,
      D = m > 0 ? T - 4 : T,
      L
    for (L = 0; L < D; L += 4)
      ((x =
        (e[d.charCodeAt(L)] << 18) |
        (e[d.charCodeAt(L + 1)] << 12) |
        (e[d.charCodeAt(L + 2)] << 6) |
        e[d.charCodeAt(L + 3)]),
        (A[I++] = (x >> 16) & 255),
        (A[I++] = (x >> 8) & 255),
        (A[I++] = x & 255))
    return (
      m === 2 &&
        ((x = (e[d.charCodeAt(L)] << 2) | (e[d.charCodeAt(L + 1)] >> 4)), (A[I++] = x & 255)),
      m === 1 &&
        ((x =
          (e[d.charCodeAt(L)] << 10) |
          (e[d.charCodeAt(L + 1)] << 4) |
          (e[d.charCodeAt(L + 2)] >> 2)),
        (A[I++] = (x >> 8) & 255),
        (A[I++] = x & 255)),
      A
    )
  }
  function g(d) {
    return t[(d >> 18) & 63] + t[(d >> 12) & 63] + t[(d >> 6) & 63] + t[d & 63]
  }
  function v(d, x, b) {
    for (var T, m = [], A = x; A < b; A += 3)
      ((T = ((d[A] << 16) & 16711680) + ((d[A + 1] << 8) & 65280) + (d[A + 2] & 255)), m.push(g(T)))
    return m.join('')
  }
  function E(d) {
    for (var x, b = d.length, T = b % 3, m = [], A = 16383, I = 0, D = b - T; I < D; I += A)
      m.push(v(d, I, I + A > D ? D : I + A))
    return (
      T === 1
        ? ((x = d[b - 1]), m.push(t[x >> 2] + t[(x << 4) & 63] + '=='))
        : T === 2 &&
          ((x = (d[b - 2] << 8) + d[b - 1]),
          m.push(t[x >> 10] + t[(x >> 4) & 63] + t[(x << 2) & 63] + '=')),
      m.join('')
    )
  }
  return br
}
var qr = {}
var El
function Jp() {
  return (
    El ||
      ((El = 1),
      (qr.read = function (t, e, r, n, i) {
        var s,
          a,
          o = i * 8 - n - 1,
          l = (1 << o) - 1,
          p = l >> 1,
          g = -7,
          v = r ? i - 1 : 0,
          E = r ? -1 : 1,
          d = t[e + v]
        for (
          v += E, s = d & ((1 << -g) - 1), d >>= -g, g += o;
          g > 0;
          s = s * 256 + t[e + v], v += E, g -= 8
        );
        for (
          a = s & ((1 << -g) - 1), s >>= -g, g += n;
          g > 0;
          a = a * 256 + t[e + v], v += E, g -= 8
        );
        if (s === 0) s = 1 - p
        else {
          if (s === l) return a ? NaN : (d ? -1 : 1) * (1 / 0)
          ;((a = a + Math.pow(2, n)), (s = s - p))
        }
        return (d ? -1 : 1) * a * Math.pow(2, s - n)
      }),
      (qr.write = function (t, e, r, n, i, s) {
        var a,
          o,
          l,
          p = s * 8 - i - 1,
          g = (1 << p) - 1,
          v = g >> 1,
          E = i === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
          d = n ? 0 : s - 1,
          x = n ? 1 : -1,
          b = e < 0 || (e === 0 && 1 / e < 0) ? 1 : 0
        for (
          e = Math.abs(e),
            isNaN(e) || e === 1 / 0
              ? ((o = isNaN(e) ? 1 : 0), (a = g))
              : ((a = Math.floor(Math.log(e) / Math.LN2)),
                e * (l = Math.pow(2, -a)) < 1 && (a--, (l *= 2)),
                a + v >= 1 ? (e += E / l) : (e += E * Math.pow(2, 1 - v)),
                e * l >= 2 && (a++, (l /= 2)),
                a + v >= g
                  ? ((o = 0), (a = g))
                  : a + v >= 1
                    ? ((o = (e * l - 1) * Math.pow(2, i)), (a = a + v))
                    : ((o = e * Math.pow(2, v - 1) * Math.pow(2, i)), (a = 0)));
          i >= 8;
          t[r + d] = o & 255, d += x, o /= 256, i -= 8
        );
        for (a = (a << i) | o, p += i; p > 0; t[r + d] = a & 255, d += x, a /= 256, p -= 8);
        t[r + d - x] |= b * 128
      })),
    qr
  )
}
var xl
function jn() {
  return (
    xl ||
      ((xl = 1),
      (function (t) {
        var e = Zp(),
          r = Jp(),
          n =
            typeof Symbol == 'function' && typeof Symbol.for == 'function'
              ? Symbol.for('nodejs.util.inspect.custom')
              : null
        ;((t.Buffer = o), (t.SlowBuffer = A), (t.INSPECT_MAX_BYTES = 50))
        var i = 2147483647
        ;((t.kMaxLength = i),
          (o.TYPED_ARRAY_SUPPORT = s()),
          !o.TYPED_ARRAY_SUPPORT &&
            typeof console < 'u' &&
            typeof console.error == 'function' &&
            console.error(
              'This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.',
            ))
        function s() {
          try {
            var _ = new Uint8Array(1),
              u = {
                foo: function () {
                  return 42
                },
              }
            return (
              Object.setPrototypeOf(u, Uint8Array.prototype),
              Object.setPrototypeOf(_, u),
              _.foo() === 42
            )
          } catch {
            return !1
          }
        }
        ;(Object.defineProperty(o.prototype, 'parent', {
          enumerable: !0,
          get: function () {
            if (o.isBuffer(this)) return this.buffer
          },
        }),
          Object.defineProperty(o.prototype, 'offset', {
            enumerable: !0,
            get: function () {
              if (o.isBuffer(this)) return this.byteOffset
            },
          }))
        function a(_) {
          if (_ > i) throw new RangeError('The value "' + _ + '" is invalid for option "size"')
          var u = new Uint8Array(_)
          return (Object.setPrototypeOf(u, o.prototype), u)
        }
        function o(_, u, c) {
          if (typeof _ == 'number') {
            if (typeof u == 'string')
              throw new TypeError(
                'The "string" argument must be of type string. Received type number',
              )
            return v(_)
          }
          return l(_, u, c)
        }
        o.poolSize = 8192
        function l(_, u, c) {
          if (typeof _ == 'string') return E(_, u)
          if (ArrayBuffer.isView(_)) return x(_)
          if (_ == null)
            throw new TypeError(
              'The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' +
                typeof _,
            )
          if (
            ee(_, ArrayBuffer) ||
            (_ && ee(_.buffer, ArrayBuffer)) ||
            (typeof SharedArrayBuffer < 'u' &&
              (ee(_, SharedArrayBuffer) || (_ && ee(_.buffer, SharedArrayBuffer))))
          )
            return b(_, u, c)
          if (typeof _ == 'number')
            throw new TypeError(
              'The "value" argument must not be of type number. Received type number',
            )
          var h = _.valueOf && _.valueOf()
          if (h != null && h !== _) return o.from(h, u, c)
          var O = T(_)
          if (O) return O
          if (
            typeof Symbol < 'u' &&
            Symbol.toPrimitive != null &&
            typeof _[Symbol.toPrimitive] == 'function'
          )
            return o.from(_[Symbol.toPrimitive]('string'), u, c)
          throw new TypeError(
            'The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' +
              typeof _,
          )
        }
        ;((o.from = function (_, u, c) {
          return l(_, u, c)
        }),
          Object.setPrototypeOf(o.prototype, Uint8Array.prototype),
          Object.setPrototypeOf(o, Uint8Array))
        function p(_) {
          if (typeof _ != 'number') throw new TypeError('"size" argument must be of type number')
          if (_ < 0) throw new RangeError('The value "' + _ + '" is invalid for option "size"')
        }
        function g(_, u, c) {
          return (
            p(_),
            _ <= 0
              ? a(_)
              : u !== void 0
                ? typeof c == 'string'
                  ? a(_).fill(u, c)
                  : a(_).fill(u)
                : a(_)
          )
        }
        o.alloc = function (_, u, c) {
          return g(_, u, c)
        }
        function v(_) {
          return (p(_), a(_ < 0 ? 0 : m(_) | 0))
        }
        ;((o.allocUnsafe = function (_) {
          return v(_)
        }),
          (o.allocUnsafeSlow = function (_) {
            return v(_)
          }))
        function E(_, u) {
          if (((typeof u != 'string' || u === '') && (u = 'utf8'), !o.isEncoding(u)))
            throw new TypeError('Unknown encoding: ' + u)
          var c = I(_, u) | 0,
            h = a(c),
            O = h.write(_, u)
          return (O !== c && (h = h.slice(0, O)), h)
        }
        function d(_) {
          for (var u = _.length < 0 ? 0 : m(_.length) | 0, c = a(u), h = 0; h < u; h += 1)
            c[h] = _[h] & 255
          return c
        }
        function x(_) {
          if (ee(_, Uint8Array)) {
            var u = new Uint8Array(_)
            return b(u.buffer, u.byteOffset, u.byteLength)
          }
          return d(_)
        }
        function b(_, u, c) {
          if (u < 0 || _.byteLength < u)
            throw new RangeError('"offset" is outside of buffer bounds')
          if (_.byteLength < u + (c || 0))
            throw new RangeError('"length" is outside of buffer bounds')
          var h
          return (
            u === void 0 && c === void 0
              ? (h = new Uint8Array(_))
              : c === void 0
                ? (h = new Uint8Array(_, u))
                : (h = new Uint8Array(_, u, c)),
            Object.setPrototypeOf(h, o.prototype),
            h
          )
        }
        function T(_) {
          if (o.isBuffer(_)) {
            var u = m(_.length) | 0,
              c = a(u)
            return (c.length === 0 || _.copy(c, 0, 0, u), c)
          }
          if (_.length !== void 0) return typeof _.length != 'number' || f(_.length) ? a(0) : d(_)
          if (_.type === 'Buffer' && Array.isArray(_.data)) return d(_.data)
        }
        function m(_) {
          if (_ >= i)
            throw new RangeError(
              'Attempt to allocate Buffer larger than maximum size: 0x' + i.toString(16) + ' bytes',
            )
          return _ | 0
        }
        function A(_) {
          return (+_ != _ && (_ = 0), o.alloc(+_))
        }
        ;((o.isBuffer = function (u) {
          return u != null && u._isBuffer === !0 && u !== o.prototype
        }),
          (o.compare = function (u, c) {
            if (
              (ee(u, Uint8Array) && (u = o.from(u, u.offset, u.byteLength)),
              ee(c, Uint8Array) && (c = o.from(c, c.offset, c.byteLength)),
              !o.isBuffer(u) || !o.isBuffer(c))
            )
              throw new TypeError(
                'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array',
              )
            if (u === c) return 0
            for (var h = u.length, O = c.length, H = 0, P = Math.min(h, O); H < P; ++H)
              if (u[H] !== c[H]) {
                ;((h = u[H]), (O = c[H]))
                break
              }
            return h < O ? -1 : O < h ? 1 : 0
          }),
          (o.isEncoding = function (u) {
            switch (String(u).toLowerCase()) {
              case 'hex':
              case 'utf8':
              case 'utf-8':
              case 'ascii':
              case 'latin1':
              case 'binary':
              case 'base64':
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return !0
              default:
                return !1
            }
          }),
          (o.concat = function (u, c) {
            if (!Array.isArray(u))
              throw new TypeError('"list" argument must be an Array of Buffers')
            if (u.length === 0) return o.alloc(0)
            var h
            if (c === void 0) for (c = 0, h = 0; h < u.length; ++h) c += u[h].length
            var O = o.allocUnsafe(c),
              H = 0
            for (h = 0; h < u.length; ++h) {
              var P = u[h]
              if (ee(P, Uint8Array))
                H + P.length > O.length
                  ? o.from(P).copy(O, H)
                  : Uint8Array.prototype.set.call(O, P, H)
              else if (o.isBuffer(P)) P.copy(O, H)
              else throw new TypeError('"list" argument must be an Array of Buffers')
              H += P.length
            }
            return O
          }))
        function I(_, u) {
          if (o.isBuffer(_)) return _.length
          if (ArrayBuffer.isView(_) || ee(_, ArrayBuffer)) return _.byteLength
          if (typeof _ != 'string')
            throw new TypeError(
              'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' +
                typeof _,
            )
          var c = _.length,
            h = arguments.length > 2 && arguments[2] === !0
          if (!h && c === 0) return 0
          for (var O = !1; ; )
            switch (u) {
              case 'ascii':
              case 'latin1':
              case 'binary':
                return c
              case 'utf8':
              case 'utf-8':
                return w(_).length
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return c * 2
              case 'hex':
                return c >>> 1
              case 'base64':
                return N(_).length
              default:
                if (O) return h ? -1 : w(_).length
                ;((u = ('' + u).toLowerCase()), (O = !0))
            }
        }
        o.byteLength = I
        function D(_, u, c) {
          var h = !1
          if (
            ((u === void 0 || u < 0) && (u = 0),
            u > this.length ||
              ((c === void 0 || c > this.length) && (c = this.length), c <= 0) ||
              ((c >>>= 0), (u >>>= 0), c <= u))
          )
            return ''
          for (_ || (_ = 'utf8'); ; )
            switch (_) {
              case 'hex':
                return re(this, u, c)
              case 'utf8':
              case 'utf-8':
                return S(this, u, c)
              case 'ascii':
                return Z(this, u, c)
              case 'latin1':
              case 'binary':
                return pe(this, u, c)
              case 'base64':
                return V(this, u, c)
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return de(this, u, c)
              default:
                if (h) throw new TypeError('Unknown encoding: ' + _)
                ;((_ = (_ + '').toLowerCase()), (h = !0))
            }
        }
        o.prototype._isBuffer = !0
        function L(_, u, c) {
          var h = _[u]
          ;((_[u] = _[c]), (_[c] = h))
        }
        ;((o.prototype.swap16 = function () {
          var u = this.length
          if (u % 2 !== 0) throw new RangeError('Buffer size must be a multiple of 16-bits')
          for (var c = 0; c < u; c += 2) L(this, c, c + 1)
          return this
        }),
          (o.prototype.swap32 = function () {
            var u = this.length
            if (u % 4 !== 0) throw new RangeError('Buffer size must be a multiple of 32-bits')
            for (var c = 0; c < u; c += 4) (L(this, c, c + 3), L(this, c + 1, c + 2))
            return this
          }),
          (o.prototype.swap64 = function () {
            var u = this.length
            if (u % 8 !== 0) throw new RangeError('Buffer size must be a multiple of 64-bits')
            for (var c = 0; c < u; c += 8)
              (L(this, c, c + 7),
                L(this, c + 1, c + 6),
                L(this, c + 2, c + 5),
                L(this, c + 3, c + 4))
            return this
          }),
          (o.prototype.toString = function () {
            var u = this.length
            return u === 0 ? '' : arguments.length === 0 ? S(this, 0, u) : D.apply(this, arguments)
          }),
          (o.prototype.toLocaleString = o.prototype.toString),
          (o.prototype.equals = function (u) {
            if (!o.isBuffer(u)) throw new TypeError('Argument must be a Buffer')
            return this === u ? !0 : o.compare(this, u) === 0
          }),
          (o.prototype.inspect = function () {
            var u = '',
              c = t.INSPECT_MAX_BYTES
            return (
              (u = this.toString('hex', 0, c)
                .replace(/(.{2})/g, '$1 ')
                .trim()),
              this.length > c && (u += ' ... '),
              '<Buffer ' + u + '>'
            )
          }),
          n && (o.prototype[n] = o.prototype.inspect),
          (o.prototype.compare = function (u, c, h, O, H) {
            if ((ee(u, Uint8Array) && (u = o.from(u, u.offset, u.byteLength)), !o.isBuffer(u)))
              throw new TypeError(
                'The "target" argument must be one of type Buffer or Uint8Array. Received type ' +
                  typeof u,
              )
            if (
              (c === void 0 && (c = 0),
              h === void 0 && (h = u ? u.length : 0),
              O === void 0 && (O = 0),
              H === void 0 && (H = this.length),
              c < 0 || h > u.length || O < 0 || H > this.length)
            )
              throw new RangeError('out of range index')
            if (O >= H && c >= h) return 0
            if (O >= H) return -1
            if (c >= h) return 1
            if (((c >>>= 0), (h >>>= 0), (O >>>= 0), (H >>>= 0), this === u)) return 0
            for (
              var P = H - O,
                ne = h - c,
                ue = Math.min(P, ne),
                se = this.slice(O, H),
                fe = u.slice(c, h),
                me = 0;
              me < ue;
              ++me
            )
              if (se[me] !== fe[me]) {
                ;((P = se[me]), (ne = fe[me]))
                break
              }
            return P < ne ? -1 : ne < P ? 1 : 0
          }))
        function q(_, u, c, h, O) {
          if (_.length === 0) return -1
          if (
            (typeof c == 'string'
              ? ((h = c), (c = 0))
              : c > 2147483647
                ? (c = 2147483647)
                : c < -2147483648 && (c = -2147483648),
            (c = +c),
            f(c) && (c = O ? 0 : _.length - 1),
            c < 0 && (c = _.length + c),
            c >= _.length)
          ) {
            if (O) return -1
            c = _.length - 1
          } else if (c < 0)
            if (O) c = 0
            else return -1
          if ((typeof u == 'string' && (u = o.from(u, h)), o.isBuffer(u)))
            return u.length === 0 ? -1 : K(_, u, c, h, O)
          if (typeof u == 'number')
            return (
              (u = u & 255),
              typeof Uint8Array.prototype.indexOf == 'function'
                ? O
                  ? Uint8Array.prototype.indexOf.call(_, u, c)
                  : Uint8Array.prototype.lastIndexOf.call(_, u, c)
                : K(_, [u], c, h, O)
            )
          throw new TypeError('val must be string, number or Buffer')
        }
        function K(_, u, c, h, O) {
          var H = 1,
            P = _.length,
            ne = u.length
          if (
            h !== void 0 &&
            ((h = String(h).toLowerCase()),
            h === 'ucs2' || h === 'ucs-2' || h === 'utf16le' || h === 'utf-16le')
          ) {
            if (_.length < 2 || u.length < 2) return -1
            ;((H = 2), (P /= 2), (ne /= 2), (c /= 2))
          }
          function ue(Pe, Ct) {
            return H === 1 ? Pe[Ct] : Pe.readUInt16BE(Ct * H)
          }
          var se
          if (O) {
            var fe = -1
            for (se = c; se < P; se++)
              if (ue(_, se) === ue(u, fe === -1 ? 0 : se - fe)) {
                if ((fe === -1 && (fe = se), se - fe + 1 === ne)) return fe * H
              } else (fe !== -1 && (se -= se - fe), (fe = -1))
          } else
            for (c + ne > P && (c = P - ne), se = c; se >= 0; se--) {
              for (var me = !0, we = 0; we < ne; we++)
                if (ue(_, se + we) !== ue(u, we)) {
                  me = !1
                  break
                }
              if (me) return se
            }
          return -1
        }
        ;((o.prototype.includes = function (u, c, h) {
          return this.indexOf(u, c, h) !== -1
        }),
          (o.prototype.indexOf = function (u, c, h) {
            return q(this, u, c, h, !0)
          }),
          (o.prototype.lastIndexOf = function (u, c, h) {
            return q(this, u, c, h, !1)
          }))
        function J(_, u, c, h) {
          c = Number(c) || 0
          var O = _.length - c
          h ? ((h = Number(h)), h > O && (h = O)) : (h = O)
          var H = u.length
          h > H / 2 && (h = H / 2)
          for (var P = 0; P < h; ++P) {
            var ne = parseInt(u.substr(P * 2, 2), 16)
            if (f(ne)) return P
            _[c + P] = ne
          }
          return P
        }
        function R(_, u, c, h) {
          return C(w(u, _.length - c), _, c, h)
        }
        function oe(_, u, c, h) {
          return C(U(u), _, c, h)
        }
        function he(_, u, c, h) {
          return C(N(u), _, c, h)
        }
        function F(_, u, c, h) {
          return C(B(u, _.length - c), _, c, h)
        }
        ;((o.prototype.write = function (u, c, h, O) {
          if (c === void 0) ((O = 'utf8'), (h = this.length), (c = 0))
          else if (h === void 0 && typeof c == 'string') ((O = c), (h = this.length), (c = 0))
          else if (isFinite(c))
            ((c = c >>> 0),
              isFinite(h) ? ((h = h >>> 0), O === void 0 && (O = 'utf8')) : ((O = h), (h = void 0)))
          else
            throw new Error(
              'Buffer.write(string, encoding, offset[, length]) is no longer supported',
            )
          var H = this.length - c
          if (
            ((h === void 0 || h > H) && (h = H),
            (u.length > 0 && (h < 0 || c < 0)) || c > this.length)
          )
            throw new RangeError('Attempt to write outside buffer bounds')
          O || (O = 'utf8')
          for (var P = !1; ; )
            switch (O) {
              case 'hex':
                return J(this, u, c, h)
              case 'utf8':
              case 'utf-8':
                return R(this, u, c, h)
              case 'ascii':
              case 'latin1':
              case 'binary':
                return oe(this, u, c, h)
              case 'base64':
                return he(this, u, c, h)
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return F(this, u, c, h)
              default:
                if (P) throw new TypeError('Unknown encoding: ' + O)
                ;((O = ('' + O).toLowerCase()), (P = !0))
            }
        }),
          (o.prototype.toJSON = function () {
            return { type: 'Buffer', data: Array.prototype.slice.call(this._arr || this, 0) }
          }))
        function V(_, u, c) {
          return u === 0 && c === _.length ? e.fromByteArray(_) : e.fromByteArray(_.slice(u, c))
        }
        function S(_, u, c) {
          c = Math.min(_.length, c)
          for (var h = [], O = u; O < c; ) {
            var H = _[O],
              P = null,
              ne = H > 239 ? 4 : H > 223 ? 3 : H > 191 ? 2 : 1
            if (O + ne <= c) {
              var ue, se, fe, me
              switch (ne) {
                case 1:
                  H < 128 && (P = H)
                  break
                case 2:
                  ;((ue = _[O + 1]),
                    (ue & 192) === 128 &&
                      ((me = ((H & 31) << 6) | (ue & 63)), me > 127 && (P = me)))
                  break
                case 3:
                  ;((ue = _[O + 1]),
                    (se = _[O + 2]),
                    (ue & 192) === 128 &&
                      (se & 192) === 128 &&
                      ((me = ((H & 15) << 12) | ((ue & 63) << 6) | (se & 63)),
                      me > 2047 && (me < 55296 || me > 57343) && (P = me)))
                  break
                case 4:
                  ;((ue = _[O + 1]),
                    (se = _[O + 2]),
                    (fe = _[O + 3]),
                    (ue & 192) === 128 &&
                      (se & 192) === 128 &&
                      (fe & 192) === 128 &&
                      ((me = ((H & 15) << 18) | ((ue & 63) << 12) | ((se & 63) << 6) | (fe & 63)),
                      me > 65535 && me < 1114112 && (P = me)))
              }
            }
            ;(P === null
              ? ((P = 65533), (ne = 1))
              : P > 65535 &&
                ((P -= 65536), h.push(((P >>> 10) & 1023) | 55296), (P = 56320 | (P & 1023))),
              h.push(P),
              (O += ne))
          }
          return le(h)
        }
        var Y = 4096
        function le(_) {
          var u = _.length
          if (u <= Y) return String.fromCharCode.apply(String, _)
          for (var c = '', h = 0; h < u; )
            c += String.fromCharCode.apply(String, _.slice(h, (h += Y)))
          return c
        }
        function Z(_, u, c) {
          var h = ''
          c = Math.min(_.length, c)
          for (var O = u; O < c; ++O) h += String.fromCharCode(_[O] & 127)
          return h
        }
        function pe(_, u, c) {
          var h = ''
          c = Math.min(_.length, c)
          for (var O = u; O < c; ++O) h += String.fromCharCode(_[O])
          return h
        }
        function re(_, u, c) {
          var h = _.length
          ;((!u || u < 0) && (u = 0), (!c || c < 0 || c > h) && (c = h))
          for (var O = '', H = u; H < c; ++H) O += X[_[H]]
          return O
        }
        function de(_, u, c) {
          for (var h = _.slice(u, c), O = '', H = 0; H < h.length - 1; H += 2)
            O += String.fromCharCode(h[H] + h[H + 1] * 256)
          return O
        }
        o.prototype.slice = function (u, c) {
          var h = this.length
          ;((u = ~~u),
            (c = c === void 0 ? h : ~~c),
            u < 0 ? ((u += h), u < 0 && (u = 0)) : u > h && (u = h),
            c < 0 ? ((c += h), c < 0 && (c = 0)) : c > h && (c = h),
            c < u && (c = u))
          var O = this.subarray(u, c)
          return (Object.setPrototypeOf(O, o.prototype), O)
        }
        function j(_, u, c) {
          if (_ % 1 !== 0 || _ < 0) throw new RangeError('offset is not uint')
          if (_ + u > c) throw new RangeError('Trying to access beyond buffer length')
        }
        ;((o.prototype.readUintLE = o.prototype.readUIntLE =
          function (u, c, h) {
            ;((u = u >>> 0), (c = c >>> 0), h || j(u, c, this.length))
            for (var O = this[u], H = 1, P = 0; ++P < c && (H *= 256); ) O += this[u + P] * H
            return O
          }),
          (o.prototype.readUintBE = o.prototype.readUIntBE =
            function (u, c, h) {
              ;((u = u >>> 0), (c = c >>> 0), h || j(u, c, this.length))
              for (var O = this[u + --c], H = 1; c > 0 && (H *= 256); ) O += this[u + --c] * H
              return O
            }),
          (o.prototype.readUint8 = o.prototype.readUInt8 =
            function (u, c) {
              return ((u = u >>> 0), c || j(u, 1, this.length), this[u])
            }),
          (o.prototype.readUint16LE = o.prototype.readUInt16LE =
            function (u, c) {
              return ((u = u >>> 0), c || j(u, 2, this.length), this[u] | (this[u + 1] << 8))
            }),
          (o.prototype.readUint16BE = o.prototype.readUInt16BE =
            function (u, c) {
              return ((u = u >>> 0), c || j(u, 2, this.length), (this[u] << 8) | this[u + 1])
            }),
          (o.prototype.readUint32LE = o.prototype.readUInt32LE =
            function (u, c) {
              return (
                (u = u >>> 0),
                c || j(u, 4, this.length),
                (this[u] | (this[u + 1] << 8) | (this[u + 2] << 16)) + this[u + 3] * 16777216
              )
            }),
          (o.prototype.readUint32BE = o.prototype.readUInt32BE =
            function (u, c) {
              return (
                (u = u >>> 0),
                c || j(u, 4, this.length),
                this[u] * 16777216 + ((this[u + 1] << 16) | (this[u + 2] << 8) | this[u + 3])
              )
            }),
          (o.prototype.readIntLE = function (u, c, h) {
            ;((u = u >>> 0), (c = c >>> 0), h || j(u, c, this.length))
            for (var O = this[u], H = 1, P = 0; ++P < c && (H *= 256); ) O += this[u + P] * H
            return ((H *= 128), O >= H && (O -= Math.pow(2, 8 * c)), O)
          }),
          (o.prototype.readIntBE = function (u, c, h) {
            ;((u = u >>> 0), (c = c >>> 0), h || j(u, c, this.length))
            for (var O = c, H = 1, P = this[u + --O]; O > 0 && (H *= 256); ) P += this[u + --O] * H
            return ((H *= 128), P >= H && (P -= Math.pow(2, 8 * c)), P)
          }),
          (o.prototype.readInt8 = function (u, c) {
            return (
              (u = u >>> 0),
              c || j(u, 1, this.length),
              this[u] & 128 ? (255 - this[u] + 1) * -1 : this[u]
            )
          }),
          (o.prototype.readInt16LE = function (u, c) {
            ;((u = u >>> 0), c || j(u, 2, this.length))
            var h = this[u] | (this[u + 1] << 8)
            return h & 32768 ? h | 4294901760 : h
          }),
          (o.prototype.readInt16BE = function (u, c) {
            ;((u = u >>> 0), c || j(u, 2, this.length))
            var h = this[u + 1] | (this[u] << 8)
            return h & 32768 ? h | 4294901760 : h
          }),
          (o.prototype.readInt32LE = function (u, c) {
            return (
              (u = u >>> 0),
              c || j(u, 4, this.length),
              this[u] | (this[u + 1] << 8) | (this[u + 2] << 16) | (this[u + 3] << 24)
            )
          }),
          (o.prototype.readInt32BE = function (u, c) {
            return (
              (u = u >>> 0),
              c || j(u, 4, this.length),
              (this[u] << 24) | (this[u + 1] << 16) | (this[u + 2] << 8) | this[u + 3]
            )
          }),
          (o.prototype.readFloatLE = function (u, c) {
            return ((u = u >>> 0), c || j(u, 4, this.length), r.read(this, u, !0, 23, 4))
          }),
          (o.prototype.readFloatBE = function (u, c) {
            return ((u = u >>> 0), c || j(u, 4, this.length), r.read(this, u, !1, 23, 4))
          }),
          (o.prototype.readDoubleLE = function (u, c) {
            return ((u = u >>> 0), c || j(u, 8, this.length), r.read(this, u, !0, 52, 8))
          }),
          (o.prototype.readDoubleBE = function (u, c) {
            return ((u = u >>> 0), c || j(u, 8, this.length), r.read(this, u, !1, 52, 8))
          }))
        function k(_, u, c, h, O, H) {
          if (!o.isBuffer(_)) throw new TypeError('"buffer" argument must be a Buffer instance')
          if (u > O || u < H) throw new RangeError('"value" argument is out of bounds')
          if (c + h > _.length) throw new RangeError('Index out of range')
        }
        ;((o.prototype.writeUintLE = o.prototype.writeUIntLE =
          function (u, c, h, O) {
            if (((u = +u), (c = c >>> 0), (h = h >>> 0), !O)) {
              var H = Math.pow(2, 8 * h) - 1
              k(this, u, c, h, H, 0)
            }
            var P = 1,
              ne = 0
            for (this[c] = u & 255; ++ne < h && (P *= 256); ) this[c + ne] = (u / P) & 255
            return c + h
          }),
          (o.prototype.writeUintBE = o.prototype.writeUIntBE =
            function (u, c, h, O) {
              if (((u = +u), (c = c >>> 0), (h = h >>> 0), !O)) {
                var H = Math.pow(2, 8 * h) - 1
                k(this, u, c, h, H, 0)
              }
              var P = h - 1,
                ne = 1
              for (this[c + P] = u & 255; --P >= 0 && (ne *= 256); ) this[c + P] = (u / ne) & 255
              return c + h
            }),
          (o.prototype.writeUint8 = o.prototype.writeUInt8 =
            function (u, c, h) {
              return (
                (u = +u), (c = c >>> 0), h || k(this, u, c, 1, 255, 0), (this[c] = u & 255), c + 1
              )
            }),
          (o.prototype.writeUint16LE = o.prototype.writeUInt16LE =
            function (u, c, h) {
              return (
                (u = +u),
                (c = c >>> 0),
                h || k(this, u, c, 2, 65535, 0),
                (this[c] = u & 255),
                (this[c + 1] = u >>> 8),
                c + 2
              )
            }),
          (o.prototype.writeUint16BE = o.prototype.writeUInt16BE =
            function (u, c, h) {
              return (
                (u = +u),
                (c = c >>> 0),
                h || k(this, u, c, 2, 65535, 0),
                (this[c] = u >>> 8),
                (this[c + 1] = u & 255),
                c + 2
              )
            }),
          (o.prototype.writeUint32LE = o.prototype.writeUInt32LE =
            function (u, c, h) {
              return (
                (u = +u),
                (c = c >>> 0),
                h || k(this, u, c, 4, 4294967295, 0),
                (this[c + 3] = u >>> 24),
                (this[c + 2] = u >>> 16),
                (this[c + 1] = u >>> 8),
                (this[c] = u & 255),
                c + 4
              )
            }),
          (o.prototype.writeUint32BE = o.prototype.writeUInt32BE =
            function (u, c, h) {
              return (
                (u = +u),
                (c = c >>> 0),
                h || k(this, u, c, 4, 4294967295, 0),
                (this[c] = u >>> 24),
                (this[c + 1] = u >>> 16),
                (this[c + 2] = u >>> 8),
                (this[c + 3] = u & 255),
                c + 4
              )
            }),
          (o.prototype.writeIntLE = function (u, c, h, O) {
            if (((u = +u), (c = c >>> 0), !O)) {
              var H = Math.pow(2, 8 * h - 1)
              k(this, u, c, h, H - 1, -H)
            }
            var P = 0,
              ne = 1,
              ue = 0
            for (this[c] = u & 255; ++P < h && (ne *= 256); )
              (u < 0 && ue === 0 && this[c + P - 1] !== 0 && (ue = 1),
                (this[c + P] = (((u / ne) >> 0) - ue) & 255))
            return c + h
          }),
          (o.prototype.writeIntBE = function (u, c, h, O) {
            if (((u = +u), (c = c >>> 0), !O)) {
              var H = Math.pow(2, 8 * h - 1)
              k(this, u, c, h, H - 1, -H)
            }
            var P = h - 1,
              ne = 1,
              ue = 0
            for (this[c + P] = u & 255; --P >= 0 && (ne *= 256); )
              (u < 0 && ue === 0 && this[c + P + 1] !== 0 && (ue = 1),
                (this[c + P] = (((u / ne) >> 0) - ue) & 255))
            return c + h
          }),
          (o.prototype.writeInt8 = function (u, c, h) {
            return (
              (u = +u),
              (c = c >>> 0),
              h || k(this, u, c, 1, 127, -128),
              u < 0 && (u = 255 + u + 1),
              (this[c] = u & 255),
              c + 1
            )
          }),
          (o.prototype.writeInt16LE = function (u, c, h) {
            return (
              (u = +u),
              (c = c >>> 0),
              h || k(this, u, c, 2, 32767, -32768),
              (this[c] = u & 255),
              (this[c + 1] = u >>> 8),
              c + 2
            )
          }),
          (o.prototype.writeInt16BE = function (u, c, h) {
            return (
              (u = +u),
              (c = c >>> 0),
              h || k(this, u, c, 2, 32767, -32768),
              (this[c] = u >>> 8),
              (this[c + 1] = u & 255),
              c + 2
            )
          }),
          (o.prototype.writeInt32LE = function (u, c, h) {
            return (
              (u = +u),
              (c = c >>> 0),
              h || k(this, u, c, 4, 2147483647, -2147483648),
              (this[c] = u & 255),
              (this[c + 1] = u >>> 8),
              (this[c + 2] = u >>> 16),
              (this[c + 3] = u >>> 24),
              c + 4
            )
          }),
          (o.prototype.writeInt32BE = function (u, c, h) {
            return (
              (u = +u),
              (c = c >>> 0),
              h || k(this, u, c, 4, 2147483647, -2147483648),
              u < 0 && (u = 4294967295 + u + 1),
              (this[c] = u >>> 24),
              (this[c + 1] = u >>> 16),
              (this[c + 2] = u >>> 8),
              (this[c + 3] = u & 255),
              c + 4
            )
          }))
        function z(_, u, c, h, O, H) {
          if (c + h > _.length) throw new RangeError('Index out of range')
          if (c < 0) throw new RangeError('Index out of range')
        }
        function G(_, u, c, h, O) {
          return ((u = +u), (c = c >>> 0), O || z(_, u, c, 4), r.write(_, u, c, h, 23, 4), c + 4)
        }
        ;((o.prototype.writeFloatLE = function (u, c, h) {
          return G(this, u, c, !0, h)
        }),
          (o.prototype.writeFloatBE = function (u, c, h) {
            return G(this, u, c, !1, h)
          }))
        function te(_, u, c, h, O) {
          return ((u = +u), (c = c >>> 0), O || z(_, u, c, 8), r.write(_, u, c, h, 52, 8), c + 8)
        }
        ;((o.prototype.writeDoubleLE = function (u, c, h) {
          return te(this, u, c, !0, h)
        }),
          (o.prototype.writeDoubleBE = function (u, c, h) {
            return te(this, u, c, !1, h)
          }),
          (o.prototype.copy = function (u, c, h, O) {
            if (!o.isBuffer(u)) throw new TypeError('argument should be a Buffer')
            if (
              (h || (h = 0),
              !O && O !== 0 && (O = this.length),
              c >= u.length && (c = u.length),
              c || (c = 0),
              O > 0 && O < h && (O = h),
              O === h || u.length === 0 || this.length === 0)
            )
              return 0
            if (c < 0) throw new RangeError('targetStart out of bounds')
            if (h < 0 || h >= this.length) throw new RangeError('Index out of range')
            if (O < 0) throw new RangeError('sourceEnd out of bounds')
            ;(O > this.length && (O = this.length), u.length - c < O - h && (O = u.length - c + h))
            var H = O - h
            return (
              this === u && typeof Uint8Array.prototype.copyWithin == 'function'
                ? this.copyWithin(c, h, O)
                : Uint8Array.prototype.set.call(u, this.subarray(h, O), c),
              H
            )
          }),
          (o.prototype.fill = function (u, c, h, O) {
            if (typeof u == 'string') {
              if (
                (typeof c == 'string'
                  ? ((O = c), (c = 0), (h = this.length))
                  : typeof h == 'string' && ((O = h), (h = this.length)),
                O !== void 0 && typeof O != 'string')
              )
                throw new TypeError('encoding must be a string')
              if (typeof O == 'string' && !o.isEncoding(O))
                throw new TypeError('Unknown encoding: ' + O)
              if (u.length === 1) {
                var H = u.charCodeAt(0)
                ;((O === 'utf8' && H < 128) || O === 'latin1') && (u = H)
              }
            } else typeof u == 'number' ? (u = u & 255) : typeof u == 'boolean' && (u = Number(u))
            if (c < 0 || this.length < c || this.length < h)
              throw new RangeError('Out of range index')
            if (h <= c) return this
            ;((c = c >>> 0), (h = h === void 0 ? this.length : h >>> 0), u || (u = 0))
            var P
            if (typeof u == 'number') for (P = c; P < h; ++P) this[P] = u
            else {
              var ne = o.isBuffer(u) ? u : o.from(u, O),
                ue = ne.length
              if (ue === 0)
                throw new TypeError('The value "' + u + '" is invalid for argument "value"')
              for (P = 0; P < h - c; ++P) this[P + c] = ne[P % ue]
            }
            return this
          }))
        var W = /[^+/0-9A-Za-z-_]/g
        function y(_) {
          if (((_ = _.split('=')[0]), (_ = _.trim().replace(W, '')), _.length < 2)) return ''
          for (; _.length % 4 !== 0; ) _ = _ + '='
          return _
        }
        function w(_, u) {
          u = u || 1 / 0
          for (var c, h = _.length, O = null, H = [], P = 0; P < h; ++P) {
            if (((c = _.charCodeAt(P)), c > 55295 && c < 57344)) {
              if (!O) {
                if (c > 56319) {
                  ;(u -= 3) > -1 && H.push(239, 191, 189)
                  continue
                } else if (P + 1 === h) {
                  ;(u -= 3) > -1 && H.push(239, 191, 189)
                  continue
                }
                O = c
                continue
              }
              if (c < 56320) {
                ;((u -= 3) > -1 && H.push(239, 191, 189), (O = c))
                continue
              }
              c = (((O - 55296) << 10) | (c - 56320)) + 65536
            } else O && (u -= 3) > -1 && H.push(239, 191, 189)
            if (((O = null), c < 128)) {
              if ((u -= 1) < 0) break
              H.push(c)
            } else if (c < 2048) {
              if ((u -= 2) < 0) break
              H.push((c >> 6) | 192, (c & 63) | 128)
            } else if (c < 65536) {
              if ((u -= 3) < 0) break
              H.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128)
            } else if (c < 1114112) {
              if ((u -= 4) < 0) break
              H.push((c >> 18) | 240, ((c >> 12) & 63) | 128, ((c >> 6) & 63) | 128, (c & 63) | 128)
            } else throw new Error('Invalid code point')
          }
          return H
        }
        function U(_) {
          for (var u = [], c = 0; c < _.length; ++c) u.push(_.charCodeAt(c) & 255)
          return u
        }
        function B(_, u) {
          for (var c, h, O, H = [], P = 0; P < _.length && !((u -= 2) < 0); ++P)
            ((c = _.charCodeAt(P)), (h = c >> 8), (O = c % 256), H.push(O), H.push(h))
          return H
        }
        function N(_) {
          return e.toByteArray(y(_))
        }
        function C(_, u, c, h) {
          for (var O = 0; O < h && !(O + c >= u.length || O >= _.length); ++O) u[O + c] = _[O]
          return O
        }
        function ee(_, u) {
          return (
            _ instanceof u ||
            (_ != null &&
              _.constructor != null &&
              _.constructor.name != null &&
              _.constructor.name === u.name)
          )
        }
        function f(_) {
          return _ !== _
        }
        var X = (function () {
          for (var _ = '0123456789abcdef', u = new Array(256), c = 0; c < 16; ++c)
            for (var h = c * 16, O = 0; O < 16; ++O) u[h + O] = _[c] + _[O]
          return u
        })()
      })(li)),
    li
  )
}
var hi = {},
  fi = {},
  di,
  Tl
function Xf() {
  return (
    Tl ||
      ((Tl = 1),
      (di = function () {
        if (typeof Symbol != 'function' || typeof Object.getOwnPropertySymbols != 'function')
          return !1
        if (typeof Symbol.iterator == 'symbol') return !0
        var e = {},
          r = Symbol('test'),
          n = Object(r)
        if (
          typeof r == 'string' ||
          Object.prototype.toString.call(r) !== '[object Symbol]' ||
          Object.prototype.toString.call(n) !== '[object Symbol]'
        )
          return !1
        var i = 42
        e[r] = i
        for (r in e) return !1
        if (
          (typeof Object.keys == 'function' && Object.keys(e).length !== 0) ||
          (typeof Object.getOwnPropertyNames == 'function' &&
            Object.getOwnPropertyNames(e).length !== 0)
        )
          return !1
        var s = Object.getOwnPropertySymbols(e)
        if (s.length !== 1 || s[0] !== r || !Object.prototype.propertyIsEnumerable.call(e, r))
          return !1
        if (typeof Object.getOwnPropertyDescriptor == 'function') {
          var a = Object.getOwnPropertyDescriptor(e, r)
          if (a.value !== i || a.enumerable !== !0) return !1
        }
        return !0
      })),
    di
  )
}
var pi, Al
function Pc() {
  if (Al) return pi
  Al = 1
  var t = Xf()
  return (
    (pi = function () {
      return t() && !!Symbol.toStringTag
    }),
    pi
  )
}
var mi, Sl
function Qp() {
  if (Sl) return mi
  Sl = 1
  var t = typeof Symbol < 'u' && Symbol,
    e = Xf()
  return (
    (mi = function () {
      return typeof t != 'function' ||
        typeof Symbol != 'function' ||
        typeof t('foo') != 'symbol' ||
        typeof Symbol('bar') != 'symbol'
        ? !1
        : e()
    }),
    mi
  )
}
var wi, Il
function em() {
  if (Il) return wi
  Il = 1
  var t = { foo: {} },
    e = Object
  return (
    (wi = function () {
      return { __proto__: t }.foo === t.foo && !({ __proto__: null } instanceof e)
    }),
    wi
  )
}
var gi, Rl
function tm() {
  if (Rl) return gi
  Rl = 1
  var t = 'Function.prototype.bind called on incompatible ',
    e = Object.prototype.toString,
    r = Math.max,
    n = '[object Function]',
    i = function (l, p) {
      for (var g = [], v = 0; v < l.length; v += 1) g[v] = l[v]
      for (var E = 0; E < p.length; E += 1) g[E + l.length] = p[E]
      return g
    },
    s = function (l, p) {
      for (var g = [], v = p, E = 0; v < l.length; v += 1, E += 1) g[E] = l[v]
      return g
    },
    a = function (o, l) {
      for (var p = '', g = 0; g < o.length; g += 1) ((p += o[g]), g + 1 < o.length && (p += l))
      return p
    }
  return (
    (gi = function (l) {
      var p = this
      if (typeof p != 'function' || e.apply(p) !== n) throw new TypeError(t + p)
      for (
        var g = s(arguments, 1),
          v,
          E = function () {
            if (this instanceof v) {
              var m = p.apply(this, i(g, arguments))
              return Object(m) === m ? m : this
            }
            return p.apply(l, i(g, arguments))
          },
          d = r(0, p.length - g.length),
          x = [],
          b = 0;
        b < d;
        b++
      )
        x[b] = '$' + b
      if (
        ((v = Function(
          'binder',
          'return function (' + a(x, ',') + '){ return binder.apply(this,arguments); }',
        )(E)),
        p.prototype)
      ) {
        var T = function () {}
        ;((T.prototype = p.prototype), (v.prototype = new T()), (T.prototype = null))
      }
      return v
    }),
    gi
  )
}
var yi, Nl
function Uc() {
  if (Nl) return yi
  Nl = 1
  var t = tm()
  return ((yi = Function.prototype.bind || t), yi)
}
var vi, kl
function rm() {
  if (kl) return vi
  kl = 1
  var t = Function.prototype.call,
    e = Object.prototype.hasOwnProperty,
    r = Uc()
  return ((vi = r.call(t, e)), vi)
}
var _i, Cl
function pr() {
  if (Cl) return _i
  Cl = 1
  var t,
    e = SyntaxError,
    r = Function,
    n = TypeError,
    i = function (F) {
      try {
        return r('"use strict"; return (' + F + ').constructor;')()
      } catch {}
    },
    s = Object.getOwnPropertyDescriptor
  if (s)
    try {
      s({}, '')
    } catch {
      s = null
    }
  var a = function () {
      throw new n()
    },
    o = s
      ? (function () {
          try {
            return (arguments.callee, a)
          } catch {
            try {
              return s(arguments, 'callee').get
            } catch {
              return a
            }
          }
        })()
      : a,
    l = Qp()(),
    p = em()(),
    g =
      Object.getPrototypeOf ||
      (p
        ? function (F) {
            return F.__proto__
          }
        : null),
    v = {},
    E = typeof Uint8Array > 'u' || !g ? t : g(Uint8Array),
    d = {
      '%AggregateError%': typeof AggregateError > 'u' ? t : AggregateError,
      '%Array%': Array,
      '%ArrayBuffer%': typeof ArrayBuffer > 'u' ? t : ArrayBuffer,
      '%ArrayIteratorPrototype%': l && g ? g([][Symbol.iterator]()) : t,
      '%AsyncFromSyncIteratorPrototype%': t,
      '%AsyncFunction%': v,
      '%AsyncGenerator%': v,
      '%AsyncGeneratorFunction%': v,
      '%AsyncIteratorPrototype%': v,
      '%Atomics%': typeof Atomics > 'u' ? t : Atomics,
      '%BigInt%': typeof BigInt > 'u' ? t : BigInt,
      '%BigInt64Array%': typeof BigInt64Array > 'u' ? t : BigInt64Array,
      '%BigUint64Array%': typeof BigUint64Array > 'u' ? t : BigUint64Array,
      '%Boolean%': Boolean,
      '%DataView%': typeof DataView > 'u' ? t : DataView,
      '%Date%': Date,
      '%decodeURI%': decodeURI,
      '%decodeURIComponent%': decodeURIComponent,
      '%encodeURI%': encodeURI,
      '%encodeURIComponent%': encodeURIComponent,
      '%Error%': Error,
      '%eval%': eval,
      '%EvalError%': EvalError,
      '%Float32Array%': typeof Float32Array > 'u' ? t : Float32Array,
      '%Float64Array%': typeof Float64Array > 'u' ? t : Float64Array,
      '%FinalizationRegistry%': typeof FinalizationRegistry > 'u' ? t : FinalizationRegistry,
      '%Function%': r,
      '%GeneratorFunction%': v,
      '%Int8Array%': typeof Int8Array > 'u' ? t : Int8Array,
      '%Int16Array%': typeof Int16Array > 'u' ? t : Int16Array,
      '%Int32Array%': typeof Int32Array > 'u' ? t : Int32Array,
      '%isFinite%': isFinite,
      '%isNaN%': isNaN,
      '%IteratorPrototype%': l && g ? g(g([][Symbol.iterator]())) : t,
      '%JSON%': typeof JSON == 'object' ? JSON : t,
      '%Map%': typeof Map > 'u' ? t : Map,
      '%MapIteratorPrototype%': typeof Map > 'u' || !l || !g ? t : g(new Map()[Symbol.iterator]()),
      '%Math%': Math,
      '%Number%': Number,
      '%Object%': Object,
      '%parseFloat%': parseFloat,
      '%parseInt%': parseInt,
      '%Promise%': typeof Promise > 'u' ? t : Promise,
      '%Proxy%': typeof Proxy > 'u' ? t : Proxy,
      '%RangeError%': RangeError,
      '%ReferenceError%': ReferenceError,
      '%Reflect%': typeof Reflect > 'u' ? t : Reflect,
      '%RegExp%': RegExp,
      '%Set%': typeof Set > 'u' ? t : Set,
      '%SetIteratorPrototype%': typeof Set > 'u' || !l || !g ? t : g(new Set()[Symbol.iterator]()),
      '%SharedArrayBuffer%': typeof SharedArrayBuffer > 'u' ? t : SharedArrayBuffer,
      '%String%': String,
      '%StringIteratorPrototype%': l && g ? g(''[Symbol.iterator]()) : t,
      '%Symbol%': l ? Symbol : t,
      '%SyntaxError%': e,
      '%ThrowTypeError%': o,
      '%TypedArray%': E,
      '%TypeError%': n,
      '%Uint8Array%': typeof Uint8Array > 'u' ? t : Uint8Array,
      '%Uint8ClampedArray%': typeof Uint8ClampedArray > 'u' ? t : Uint8ClampedArray,
      '%Uint16Array%': typeof Uint16Array > 'u' ? t : Uint16Array,
      '%Uint32Array%': typeof Uint32Array > 'u' ? t : Uint32Array,
      '%URIError%': URIError,
      '%WeakMap%': typeof WeakMap > 'u' ? t : WeakMap,
      '%WeakRef%': typeof WeakRef > 'u' ? t : WeakRef,
      '%WeakSet%': typeof WeakSet > 'u' ? t : WeakSet,
    }
  if (g)
    try {
      null.error
    } catch (F) {
      var x = g(g(F))
      d['%Error.prototype%'] = x
    }
  var b = function F(V) {
      var S
      if (V === '%AsyncFunction%') S = i('async function () {}')
      else if (V === '%GeneratorFunction%') S = i('function* () {}')
      else if (V === '%AsyncGeneratorFunction%') S = i('async function* () {}')
      else if (V === '%AsyncGenerator%') {
        var Y = F('%AsyncGeneratorFunction%')
        Y && (S = Y.prototype)
      } else if (V === '%AsyncIteratorPrototype%') {
        var le = F('%AsyncGenerator%')
        le && g && (S = g(le.prototype))
      }
      return ((d[V] = S), S)
    },
    T = {
      '%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
      '%ArrayPrototype%': ['Array', 'prototype'],
      '%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
      '%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
      '%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
      '%ArrayProto_values%': ['Array', 'prototype', 'values'],
      '%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
      '%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
      '%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
      '%BooleanPrototype%': ['Boolean', 'prototype'],
      '%DataViewPrototype%': ['DataView', 'prototype'],
      '%DatePrototype%': ['Date', 'prototype'],
      '%ErrorPrototype%': ['Error', 'prototype'],
      '%EvalErrorPrototype%': ['EvalError', 'prototype'],
      '%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
      '%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
      '%FunctionPrototype%': ['Function', 'prototype'],
      '%Generator%': ['GeneratorFunction', 'prototype'],
      '%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
      '%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
      '%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
      '%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
      '%JSONParse%': ['JSON', 'parse'],
      '%JSONStringify%': ['JSON', 'stringify'],
      '%MapPrototype%': ['Map', 'prototype'],
      '%NumberPrototype%': ['Number', 'prototype'],
      '%ObjectPrototype%': ['Object', 'prototype'],
      '%ObjProto_toString%': ['Object', 'prototype', 'toString'],
      '%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
      '%PromisePrototype%': ['Promise', 'prototype'],
      '%PromiseProto_then%': ['Promise', 'prototype', 'then'],
      '%Promise_all%': ['Promise', 'all'],
      '%Promise_reject%': ['Promise', 'reject'],
      '%Promise_resolve%': ['Promise', 'resolve'],
      '%RangeErrorPrototype%': ['RangeError', 'prototype'],
      '%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
      '%RegExpPrototype%': ['RegExp', 'prototype'],
      '%SetPrototype%': ['Set', 'prototype'],
      '%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
      '%StringPrototype%': ['String', 'prototype'],
      '%SymbolPrototype%': ['Symbol', 'prototype'],
      '%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
      '%TypedArrayPrototype%': ['TypedArray', 'prototype'],
      '%TypeErrorPrototype%': ['TypeError', 'prototype'],
      '%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
      '%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
      '%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
      '%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
      '%URIErrorPrototype%': ['URIError', 'prototype'],
      '%WeakMapPrototype%': ['WeakMap', 'prototype'],
      '%WeakSetPrototype%': ['WeakSet', 'prototype'],
    },
    m = Uc(),
    A = rm(),
    I = m.call(Function.call, Array.prototype.concat),
    D = m.call(Function.apply, Array.prototype.splice),
    L = m.call(Function.call, String.prototype.replace),
    q = m.call(Function.call, String.prototype.slice),
    K = m.call(Function.call, RegExp.prototype.exec),
    J =
      /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g,
    R = /\\(\\)?/g,
    oe = function (V) {
      var S = q(V, 0, 1),
        Y = q(V, -1)
      if (S === '%' && Y !== '%') throw new e('invalid intrinsic syntax, expected closing `%`')
      if (Y === '%' && S !== '%') throw new e('invalid intrinsic syntax, expected opening `%`')
      var le = []
      return (
        L(V, J, function (Z, pe, re, de) {
          le[le.length] = re ? L(de, R, '$1') : pe || Z
        }),
        le
      )
    },
    he = function (V, S) {
      var Y = V,
        le
      if ((A(T, Y) && ((le = T[Y]), (Y = '%' + le[0] + '%')), A(d, Y))) {
        var Z = d[Y]
        if ((Z === v && (Z = b(Y)), typeof Z > 'u' && !S))
          throw new n('intrinsic ' + V + ' exists, but is not available. Please file an issue!')
        return { alias: le, name: Y, value: Z }
      }
      throw new e('intrinsic ' + V + ' does not exist!')
    }
  return (
    (_i = function (V, S) {
      if (typeof V != 'string' || V.length === 0)
        throw new n('intrinsic name must be a non-empty string')
      if (arguments.length > 1 && typeof S != 'boolean')
        throw new n('"allowMissing" argument must be a boolean')
      if (K(/^%?[^%]*%?$/, V) === null)
        throw new e(
          '`%` may not be present anywhere but at the beginning and end of the intrinsic name',
        )
      var Y = oe(V),
        le = Y.length > 0 ? Y[0] : '',
        Z = he('%' + le + '%', S),
        pe = Z.name,
        re = Z.value,
        de = !1,
        j = Z.alias
      j && ((le = j[0]), D(Y, I([0, 1], j)))
      for (var k = 1, z = !0; k < Y.length; k += 1) {
        var G = Y[k],
          te = q(G, 0, 1),
          W = q(G, -1)
        if (
          (te === '"' || te === "'" || te === '`' || W === '"' || W === "'" || W === '`') &&
          te !== W
        )
          throw new e('property names with quotes must have matching quotes')
        if (
          ((G === 'constructor' || !z) && (de = !0),
          (le += '.' + G),
          (pe = '%' + le + '%'),
          A(d, pe))
        )
          re = d[pe]
        else if (re != null) {
          if (!(G in re)) {
            if (!S)
              throw new n('base intrinsic for ' + V + ' exists, but the property is not available.')
            return
          }
          if (s && k + 1 >= Y.length) {
            var y = s(re, G)
            ;((z = !!y),
              z && 'get' in y && !('originalValue' in y.get) ? (re = y.get) : (re = re[G]))
          } else ((z = A(re, G)), (re = re[G]))
          z && !de && (d[pe] = re)
        }
      }
      return re
    }),
    _i
  )
}
var bi = { exports: {} },
  Ei,
  Ol
function Yf() {
  if (Ol) return Ei
  Ol = 1
  var t = pr(),
    e = t('%Object.defineProperty%', !0),
    r = function () {
      if (e)
        try {
          return (e({}, 'a', { value: 1 }), !0)
        } catch {
          return !1
        }
      return !1
    }
  return (
    (r.hasArrayLengthDefineBug = function () {
      if (!r()) return null
      try {
        return e([], 'length', { value: 1 }).length !== 1
      } catch {
        return !0
      }
    }),
    (Ei = r),
    Ei
  )
}
var xi, Dl
function Mc() {
  if (Dl) return xi
  Dl = 1
  var t = pr(),
    e = t('%Object.getOwnPropertyDescriptor%', !0)
  if (e)
    try {
      e([], 'length')
    } catch {
      e = null
    }
  return ((xi = e), xi)
}
var Ti, Fl
function nm() {
  if (Fl) return Ti
  Fl = 1
  var t = Yf()(),
    e = pr(),
    r = t && e('%Object.defineProperty%', !0)
  if (r)
    try {
      r({}, 'a', { value: 1 })
    } catch {
      r = !1
    }
  var n = e('%SyntaxError%'),
    i = e('%TypeError%'),
    s = Mc()
  return (
    (Ti = function (o, l, p) {
      if (!o || (typeof o != 'object' && typeof o != 'function'))
        throw new i('`obj` must be an object or a function`')
      if (typeof l != 'string' && typeof l != 'symbol')
        throw new i('`property` must be a string or a symbol`')
      if (arguments.length > 3 && typeof arguments[3] != 'boolean' && arguments[3] !== null)
        throw new i('`nonEnumerable`, if provided, must be a boolean or null')
      if (arguments.length > 4 && typeof arguments[4] != 'boolean' && arguments[4] !== null)
        throw new i('`nonWritable`, if provided, must be a boolean or null')
      if (arguments.length > 5 && typeof arguments[5] != 'boolean' && arguments[5] !== null)
        throw new i('`nonConfigurable`, if provided, must be a boolean or null')
      if (arguments.length > 6 && typeof arguments[6] != 'boolean')
        throw new i('`loose`, if provided, must be a boolean')
      var g = arguments.length > 3 ? arguments[3] : null,
        v = arguments.length > 4 ? arguments[4] : null,
        E = arguments.length > 5 ? arguments[5] : null,
        d = arguments.length > 6 ? arguments[6] : !1,
        x = !!s && s(o, l)
      if (r)
        r(o, l, {
          configurable: E === null && x ? x.configurable : !E,
          enumerable: g === null && x ? x.enumerable : !g,
          value: p,
          writable: v === null && x ? x.writable : !v,
        })
      else if (d || (!g && !v && !E)) o[l] = p
      else
        throw new n(
          'This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.',
        )
    }),
    Ti
  )
}
var Ai, Ll
function im() {
  if (Ll) return Ai
  Ll = 1
  var t = pr(),
    e = nm(),
    r = Yf()(),
    n = Mc(),
    i = t('%TypeError%'),
    s = t('%Math.floor%')
  return (
    (Ai = function (o, l) {
      if (typeof o != 'function') throw new i('`fn` is not a function')
      if (typeof l != 'number' || l < 0 || l > 4294967295 || s(l) !== l)
        throw new i('`length` must be a positive 32-bit integer')
      var p = arguments.length > 2 && !!arguments[2],
        g = !0,
        v = !0
      if ('length' in o && n) {
        var E = n(o, 'length')
        ;(E && !E.configurable && (g = !1), E && !E.writable && (v = !1))
      }
      return ((g || v || !p) && (r ? e(o, 'length', l, !0, !0) : e(o, 'length', l)), o)
    }),
    Ai
  )
}
var Bl
function Zf() {
  return (
    Bl ||
      ((Bl = 1),
      (function (t) {
        var e = Uc(),
          r = pr(),
          n = im(),
          i = r('%TypeError%'),
          s = r('%Function.prototype.apply%'),
          a = r('%Function.prototype.call%'),
          o = r('%Reflect.apply%', !0) || e.call(a, s),
          l = r('%Object.defineProperty%', !0),
          p = r('%Math.max%')
        if (l)
          try {
            l({}, 'a', { value: 1 })
          } catch {
            l = null
          }
        t.exports = function (E) {
          if (typeof E != 'function') throw new i('a function is required')
          var d = o(e, a, arguments)
          return n(d, 1 + p(0, E.length - (arguments.length - 1)), !0)
        }
        var g = function () {
          return o(e, s, arguments)
        }
        l ? l(t.exports, 'apply', { value: g }) : (t.exports.apply = g)
      })(bi)),
    bi.exports
  )
}
var Si, Pl
function Jf() {
  if (Pl) return Si
  Pl = 1
  var t = pr(),
    e = Zf(),
    r = e(t('String.prototype.indexOf'))
  return (
    (Si = function (i, s) {
      var a = t(i, !!s)
      return typeof a == 'function' && r(i, '.prototype.') > -1 ? e(a) : a
    }),
    Si
  )
}
var Ii, Ul
function sm() {
  if (Ul) return Ii
  Ul = 1
  var t = Pc()(),
    e = Jf(),
    r = e('Object.prototype.toString'),
    n = function (o) {
      return t && o && typeof o == 'object' && Symbol.toStringTag in o
        ? !1
        : r(o) === '[object Arguments]'
    },
    i = function (o) {
      return n(o)
        ? !0
        : o !== null &&
            typeof o == 'object' &&
            typeof o.length == 'number' &&
            o.length >= 0 &&
            r(o) !== '[object Array]' &&
            r(o.callee) === '[object Function]'
    },
    s = (function () {
      return n(arguments)
    })()
  return ((n.isLegacyArguments = i), (Ii = s ? n : i), Ii)
}
var Ri, Ml
function om() {
  if (Ml) return Ri
  Ml = 1
  var t = Object.prototype.toString,
    e = Function.prototype.toString,
    r = /^\s*(?:function)?\*/,
    n = Pc()(),
    i = Object.getPrototypeOf,
    s = function () {
      if (!n) return !1
      try {
        return Function('return function*() {}')()
      } catch {}
    },
    a
  return (
    (Ri = function (l) {
      if (typeof l != 'function') return !1
      if (r.test(e.call(l))) return !0
      if (!n) {
        var p = t.call(l)
        return p === '[object GeneratorFunction]'
      }
      if (!i) return !1
      if (typeof a > 'u') {
        var g = s()
        a = g ? i(g) : !1
      }
      return i(l) === a
    }),
    Ri
  )
}
var Ni, Hl
function am() {
  if (Hl) return Ni
  Hl = 1
  var t = Function.prototype.toString,
    e = typeof Reflect == 'object' && Reflect !== null && Reflect.apply,
    r,
    n
  if (typeof e == 'function' && typeof Object.defineProperty == 'function')
    try {
      ;((r = Object.defineProperty({}, 'length', {
        get: function () {
          throw n
        },
      })),
        (n = {}),
        e(
          function () {
            throw 42
          },
          null,
          r,
        ))
    } catch (A) {
      A !== n && (e = null)
    }
  else e = null
  var i = /^\s*class\b/,
    s = function (I) {
      try {
        var D = t.call(I)
        return i.test(D)
      } catch {
        return !1
      }
    },
    a = function (I) {
      try {
        return s(I) ? !1 : (t.call(I), !0)
      } catch {
        return !1
      }
    },
    o = Object.prototype.toString,
    l = '[object Object]',
    p = '[object Function]',
    g = '[object GeneratorFunction]',
    v = '[object HTMLAllCollection]',
    E = '[object HTML document.all class]',
    d = '[object HTMLCollection]',
    x = typeof Symbol == 'function' && !!Symbol.toStringTag,
    b = !(0 in [,]),
    T = function () {
      return !1
    }
  if (typeof document == 'object') {
    var m = document.all
    o.call(m) === o.call(document.all) &&
      (T = function (I) {
        if ((b || !I) && (typeof I > 'u' || typeof I == 'object'))
          try {
            var D = o.call(I)
            return (D === v || D === E || D === d || D === l) && I('') == null
          } catch {}
        return !1
      })
  }
  return (
    (Ni = e
      ? function (I) {
          if (T(I)) return !0
          if (!I || (typeof I != 'function' && typeof I != 'object')) return !1
          try {
            e(I, null, r)
          } catch (D) {
            if (D !== n) return !1
          }
          return !s(I) && a(I)
        }
      : function (I) {
          if (T(I)) return !0
          if (!I || (typeof I != 'function' && typeof I != 'object')) return !1
          if (x) return a(I)
          if (s(I)) return !1
          var D = o.call(I)
          return D !== p && D !== g && !/^\[object HTML/.test(D) ? !1 : a(I)
        }),
    Ni
  )
}
var ki, Wl
function um() {
  if (Wl) return ki
  Wl = 1
  var t = am(),
    e = Object.prototype.toString,
    r = Object.prototype.hasOwnProperty,
    n = function (l, p, g) {
      for (var v = 0, E = l.length; v < E; v++)
        r.call(l, v) && (g == null ? p(l[v], v, l) : p.call(g, l[v], v, l))
    },
    i = function (l, p, g) {
      for (var v = 0, E = l.length; v < E; v++)
        g == null ? p(l.charAt(v), v, l) : p.call(g, l.charAt(v), v, l)
    },
    s = function (l, p, g) {
      for (var v in l) r.call(l, v) && (g == null ? p(l[v], v, l) : p.call(g, l[v], v, l))
    },
    a = function (l, p, g) {
      if (!t(p)) throw new TypeError('iterator must be a function')
      var v
      ;(arguments.length >= 3 && (v = g),
        e.call(l) === '[object Array]'
          ? n(l, p, v)
          : typeof l == 'string'
            ? i(l, p, v)
            : s(l, p, v))
    }
  return ((ki = a), ki)
}
var Ci, zl
function cm() {
  if (zl) return Ci
  zl = 1
  var t = [
      'BigInt64Array',
      'BigUint64Array',
      'Float32Array',
      'Float64Array',
      'Int16Array',
      'Int32Array',
      'Int8Array',
      'Uint16Array',
      'Uint32Array',
      'Uint8Array',
      'Uint8ClampedArray',
    ],
    e = typeof globalThis > 'u' ? ct : globalThis
  return (
    (Ci = function () {
      for (var n = [], i = 0; i < t.length; i++)
        typeof e[t[i]] == 'function' && (n[n.length] = t[i])
      return n
    }),
    Ci
  )
}
var Oi, jl
function Qf() {
  if (jl) return Oi
  jl = 1
  var t = um(),
    e = cm(),
    r = Zf(),
    n = Jf(),
    i = Mc(),
    s = n('Object.prototype.toString'),
    a = Pc()(),
    o = typeof globalThis > 'u' ? ct : globalThis,
    l = e(),
    p = n('String.prototype.slice'),
    g = Object.getPrototypeOf,
    v =
      n('Array.prototype.indexOf', !0) ||
      function (T, m) {
        for (var A = 0; A < T.length; A += 1) if (T[A] === m) return A
        return -1
      },
    E = { __proto__: null }
  a && i && g
    ? t(l, function (b) {
        var T = new o[b]()
        if (Symbol.toStringTag in T) {
          var m = g(T),
            A = i(m, Symbol.toStringTag)
          if (!A) {
            var I = g(m)
            A = i(I, Symbol.toStringTag)
          }
          E['$' + b] = r(A.get)
        }
      })
    : t(l, function (b) {
        var T = new o[b](),
          m = T.slice || T.set
        m && (E['$' + b] = r(m))
      })
  var d = function (T) {
      var m = !1
      return (
        t(E, function (A, I) {
          if (!m)
            try {
              '$' + A(T) === I && (m = p(I, 1))
            } catch {}
        }),
        m
      )
    },
    x = function (T) {
      var m = !1
      return (
        t(E, function (A, I) {
          if (!m)
            try {
              ;(A(T), (m = p(I, 1)))
            } catch {}
        }),
        m
      )
    }
  return (
    (Oi = function (T) {
      if (!T || typeof T != 'object') return !1
      if (!a) {
        var m = p(s(T), 8, -1)
        return v(l, m) > -1 ? m : m !== 'Object' ? !1 : x(T)
      }
      return i ? d(T) : null
    }),
    Oi
  )
}
var Di, Gl
function lm() {
  if (Gl) return Di
  Gl = 1
  var t = Qf()
  return (
    (Di = function (r) {
      return !!t(r)
    }),
    Di
  )
}
var Kl
function hm() {
  return (
    Kl ||
      ((Kl = 1),
      (function (t) {
        var e = sm(),
          r = om(),
          n = Qf(),
          i = lm()
        function s(h) {
          return h.call.bind(h)
        }
        var a = typeof BigInt < 'u',
          o = typeof Symbol < 'u',
          l = s(Object.prototype.toString),
          p = s(Number.prototype.valueOf),
          g = s(String.prototype.valueOf),
          v = s(Boolean.prototype.valueOf)
        if (a) var E = s(BigInt.prototype.valueOf)
        if (o) var d = s(Symbol.prototype.valueOf)
        function x(h, O) {
          if (typeof h != 'object') return !1
          try {
            return (O(h), !0)
          } catch {
            return !1
          }
        }
        ;((t.isArgumentsObject = e), (t.isGeneratorFunction = r), (t.isTypedArray = i))
        function b(h) {
          return (
            (typeof Promise < 'u' && h instanceof Promise) ||
            (h !== null &&
              typeof h == 'object' &&
              typeof h.then == 'function' &&
              typeof h.catch == 'function')
          )
        }
        t.isPromise = b
        function T(h) {
          return typeof ArrayBuffer < 'u' && ArrayBuffer.isView
            ? ArrayBuffer.isView(h)
            : i(h) || z(h)
        }
        t.isArrayBufferView = T
        function m(h) {
          return n(h) === 'Uint8Array'
        }
        t.isUint8Array = m
        function A(h) {
          return n(h) === 'Uint8ClampedArray'
        }
        t.isUint8ClampedArray = A
        function I(h) {
          return n(h) === 'Uint16Array'
        }
        t.isUint16Array = I
        function D(h) {
          return n(h) === 'Uint32Array'
        }
        t.isUint32Array = D
        function L(h) {
          return n(h) === 'Int8Array'
        }
        t.isInt8Array = L
        function q(h) {
          return n(h) === 'Int16Array'
        }
        t.isInt16Array = q
        function K(h) {
          return n(h) === 'Int32Array'
        }
        t.isInt32Array = K
        function J(h) {
          return n(h) === 'Float32Array'
        }
        t.isFloat32Array = J
        function R(h) {
          return n(h) === 'Float64Array'
        }
        t.isFloat64Array = R
        function oe(h) {
          return n(h) === 'BigInt64Array'
        }
        t.isBigInt64Array = oe
        function he(h) {
          return n(h) === 'BigUint64Array'
        }
        t.isBigUint64Array = he
        function F(h) {
          return l(h) === '[object Map]'
        }
        F.working = typeof Map < 'u' && F(new Map())
        function V(h) {
          return typeof Map > 'u' ? !1 : F.working ? F(h) : h instanceof Map
        }
        t.isMap = V
        function S(h) {
          return l(h) === '[object Set]'
        }
        S.working = typeof Set < 'u' && S(new Set())
        function Y(h) {
          return typeof Set > 'u' ? !1 : S.working ? S(h) : h instanceof Set
        }
        t.isSet = Y
        function le(h) {
          return l(h) === '[object WeakMap]'
        }
        le.working = typeof WeakMap < 'u' && le(new WeakMap())
        function Z(h) {
          return typeof WeakMap > 'u' ? !1 : le.working ? le(h) : h instanceof WeakMap
        }
        t.isWeakMap = Z
        function pe(h) {
          return l(h) === '[object WeakSet]'
        }
        pe.working = typeof WeakSet < 'u' && pe(new WeakSet())
        function re(h) {
          return pe(h)
        }
        t.isWeakSet = re
        function de(h) {
          return l(h) === '[object ArrayBuffer]'
        }
        de.working = typeof ArrayBuffer < 'u' && de(new ArrayBuffer())
        function j(h) {
          return typeof ArrayBuffer > 'u' ? !1 : de.working ? de(h) : h instanceof ArrayBuffer
        }
        t.isArrayBuffer = j
        function k(h) {
          return l(h) === '[object DataView]'
        }
        k.working =
          typeof ArrayBuffer < 'u' &&
          typeof DataView < 'u' &&
          k(new DataView(new ArrayBuffer(1), 0, 1))
        function z(h) {
          return typeof DataView > 'u' ? !1 : k.working ? k(h) : h instanceof DataView
        }
        t.isDataView = z
        var G = typeof SharedArrayBuffer < 'u' ? SharedArrayBuffer : void 0
        function te(h) {
          return l(h) === '[object SharedArrayBuffer]'
        }
        function W(h) {
          return typeof G > 'u'
            ? !1
            : (typeof te.working > 'u' && (te.working = te(new G())),
              te.working ? te(h) : h instanceof G)
        }
        t.isSharedArrayBuffer = W
        function y(h) {
          return l(h) === '[object AsyncFunction]'
        }
        t.isAsyncFunction = y
        function w(h) {
          return l(h) === '[object Map Iterator]'
        }
        t.isMapIterator = w
        function U(h) {
          return l(h) === '[object Set Iterator]'
        }
        t.isSetIterator = U
        function B(h) {
          return l(h) === '[object Generator]'
        }
        t.isGeneratorObject = B
        function N(h) {
          return l(h) === '[object WebAssembly.Module]'
        }
        t.isWebAssemblyCompiledModule = N
        function C(h) {
          return x(h, p)
        }
        t.isNumberObject = C
        function ee(h) {
          return x(h, g)
        }
        t.isStringObject = ee
        function f(h) {
          return x(h, v)
        }
        t.isBooleanObject = f
        function X(h) {
          return a && x(h, E)
        }
        t.isBigIntObject = X
        function _(h) {
          return o && x(h, d)
        }
        t.isSymbolObject = _
        function u(h) {
          return C(h) || ee(h) || f(h) || X(h) || _(h)
        }
        t.isBoxedPrimitive = u
        function c(h) {
          return typeof Uint8Array < 'u' && (j(h) || W(h))
        }
        ;((t.isAnyArrayBuffer = c),
          ['isProxy', 'isExternal', 'isModuleNamespaceObject'].forEach(function (h) {
            Object.defineProperty(t, h, {
              enumerable: !1,
              value: function () {
                throw new Error(h + ' is not supported in userland')
              },
            })
          }))
      })(fi)),
    fi
  )
}
var Fi, $l
function fm() {
  return (
    $l ||
      (($l = 1),
      (Fi = function (e) {
        return (
          e &&
          typeof e == 'object' &&
          typeof e.copy == 'function' &&
          typeof e.fill == 'function' &&
          typeof e.readUInt8 == 'function'
        )
      })),
    Fi
  )
}
var Vl
function ed() {
  return (
    Vl ||
      ((Vl = 1),
      (function (t) {
        var e =
            Object.getOwnPropertyDescriptors ||
            function (z) {
              for (var G = Object.keys(z), te = {}, W = 0; W < G.length; W++)
                te[G[W]] = Object.getOwnPropertyDescriptor(z, G[W])
              return te
            },
          r = /%[sdj%]/g
        ;((t.format = function (k) {
          if (!L(k)) {
            for (var z = [], G = 0; G < arguments.length; G++) z.push(a(arguments[G]))
            return z.join(' ')
          }
          for (
            var G = 1,
              te = arguments,
              W = te.length,
              y = String(k).replace(r, function (U) {
                if (U === '%%') return '%'
                if (G >= W) return U
                switch (U) {
                  case '%s':
                    return String(te[G++])
                  case '%d':
                    return Number(te[G++])
                  case '%j':
                    try {
                      return JSON.stringify(te[G++])
                    } catch {
                      return '[Circular]'
                    }
                  default:
                    return U
                }
              }),
              w = te[G];
            G < W;
            w = te[++G]
          )
            A(w) || !R(w) ? (y += ' ' + w) : (y += ' ' + a(w))
          return y
        }),
          (t.deprecate = function (k, z) {
            if (typeof _e < 'u' && _e.noDeprecation === !0) return k
            if (typeof _e > 'u')
              return function () {
                return t.deprecate(k, z).apply(this, arguments)
              }
            var G = !1
            function te() {
              if (!G) {
                if (_e.throwDeprecation) throw new Error(z)
                ;(_e.traceDeprecation ? console.trace(z) : console.error(z), (G = !0))
              }
              return k.apply(this, arguments)
            }
            return te
          }))
        var n = {},
          i = /^$/
        if (_e.env.NODE_DEBUG) {
          var s = _e.env.NODE_DEBUG
          ;((s = s
            .replace(/[|\\{}()[\]^$+?.]/g, '\\$&')
            .replace(/\*/g, '.*')
            .replace(/,/g, '$|^')
            .toUpperCase()),
            (i = new RegExp('^' + s + '$', 'i')))
        }
        t.debuglog = function (k) {
          if (((k = k.toUpperCase()), !n[k]))
            if (i.test(k)) {
              var z = _e.pid
              n[k] = function () {
                var G = t.format.apply(t, arguments)
                console.error('%s %d: %s', k, z, G)
              }
            } else n[k] = function () {}
          return n[k]
        }
        function a(k, z) {
          var G = { seen: [], stylize: l }
          return (
            arguments.length >= 3 && (G.depth = arguments[2]),
            arguments.length >= 4 && (G.colors = arguments[3]),
            m(z) ? (G.showHidden = z) : z && t._extend(G, z),
            K(G.showHidden) && (G.showHidden = !1),
            K(G.depth) && (G.depth = 2),
            K(G.colors) && (G.colors = !1),
            K(G.customInspect) && (G.customInspect = !0),
            G.colors && (G.stylize = o),
            g(G, k, G.depth)
          )
        }
        ;((t.inspect = a),
          (a.colors = {
            bold: [1, 22],
            italic: [3, 23],
            underline: [4, 24],
            inverse: [7, 27],
            white: [37, 39],
            grey: [90, 39],
            black: [30, 39],
            blue: [34, 39],
            cyan: [36, 39],
            green: [32, 39],
            magenta: [35, 39],
            red: [31, 39],
            yellow: [33, 39],
          }),
          (a.styles = {
            special: 'cyan',
            number: 'yellow',
            boolean: 'yellow',
            undefined: 'grey',
            null: 'bold',
            string: 'green',
            date: 'magenta',
            regexp: 'red',
          }))
        function o(k, z) {
          var G = a.styles[z]
          return G ? '\x1B[' + a.colors[G][0] + 'm' + k + '\x1B[' + a.colors[G][1] + 'm' : k
        }
        function l(k, z) {
          return k
        }
        function p(k) {
          var z = {}
          return (
            k.forEach(function (G, te) {
              z[G] = !0
            }),
            z
          )
        }
        function g(k, z, G) {
          if (
            k.customInspect &&
            z &&
            F(z.inspect) &&
            z.inspect !== t.inspect &&
            !(z.constructor && z.constructor.prototype === z)
          ) {
            var te = z.inspect(G, k)
            return (L(te) || (te = g(k, te, G)), te)
          }
          var W = v(k, z)
          if (W) return W
          var y = Object.keys(z),
            w = p(y)
          if (
            (k.showHidden && (y = Object.getOwnPropertyNames(z)),
            he(z) && (y.indexOf('message') >= 0 || y.indexOf('description') >= 0))
          )
            return E(z)
          if (y.length === 0) {
            if (F(z)) {
              var U = z.name ? ': ' + z.name : ''
              return k.stylize('[Function' + U + ']', 'special')
            }
            if (J(z)) return k.stylize(RegExp.prototype.toString.call(z), 'regexp')
            if (oe(z)) return k.stylize(Date.prototype.toString.call(z), 'date')
            if (he(z)) return E(z)
          }
          var B = '',
            N = !1,
            C = ['{', '}']
          if ((T(z) && ((N = !0), (C = ['[', ']'])), F(z))) {
            var ee = z.name ? ': ' + z.name : ''
            B = ' [Function' + ee + ']'
          }
          if (
            (J(z) && (B = ' ' + RegExp.prototype.toString.call(z)),
            oe(z) && (B = ' ' + Date.prototype.toUTCString.call(z)),
            he(z) && (B = ' ' + E(z)),
            y.length === 0 && (!N || z.length == 0))
          )
            return C[0] + B + C[1]
          if (G < 0)
            return J(z)
              ? k.stylize(RegExp.prototype.toString.call(z), 'regexp')
              : k.stylize('[Object]', 'special')
          k.seen.push(z)
          var f
          return (
            N
              ? (f = d(k, z, G, w, y))
              : (f = y.map(function (X) {
                  return x(k, z, G, w, X, N)
                })),
            k.seen.pop(),
            b(f, B, C)
          )
        }
        function v(k, z) {
          if (K(z)) return k.stylize('undefined', 'undefined')
          if (L(z)) {
            var G =
              "'" +
              JSON.stringify(z).replace(/^"|"$/g, '').replace(/'/g, "\\'").replace(/\\"/g, '"') +
              "'"
            return k.stylize(G, 'string')
          }
          if (D(z)) return k.stylize('' + z, 'number')
          if (m(z)) return k.stylize('' + z, 'boolean')
          if (A(z)) return k.stylize('null', 'null')
        }
        function E(k) {
          return '[' + Error.prototype.toString.call(k) + ']'
        }
        function d(k, z, G, te, W) {
          for (var y = [], w = 0, U = z.length; w < U; ++w)
            pe(z, String(w)) ? y.push(x(k, z, G, te, String(w), !0)) : y.push('')
          return (
            W.forEach(function (B) {
              B.match(/^\d+$/) || y.push(x(k, z, G, te, B, !0))
            }),
            y
          )
        }
        function x(k, z, G, te, W, y) {
          var w, U, B
          if (
            ((B = Object.getOwnPropertyDescriptor(z, W) || { value: z[W] }),
            B.get
              ? B.set
                ? (U = k.stylize('[Getter/Setter]', 'special'))
                : (U = k.stylize('[Getter]', 'special'))
              : B.set && (U = k.stylize('[Setter]', 'special')),
            pe(te, W) || (w = '[' + W + ']'),
            U ||
              (k.seen.indexOf(B.value) < 0
                ? (A(G) ? (U = g(k, B.value, null)) : (U = g(k, B.value, G - 1)),
                  U.indexOf(`
`) > -1 &&
                    (y
                      ? (U = U.split(`
`)
                          .map(function (N) {
                            return '  ' + N
                          })
                          .join(`
`)
                          .slice(2))
                      : (U =
                          `
` +
                          U.split(`
`).map(function (N) {
                            return '   ' + N
                          }).join(`
`))))
                : (U = k.stylize('[Circular]', 'special'))),
            K(w))
          ) {
            if (y && W.match(/^\d+$/)) return U
            ;((w = JSON.stringify('' + W)),
              w.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)
                ? ((w = w.slice(1, -1)), (w = k.stylize(w, 'name')))
                : ((w = w
                    .replace(/'/g, "\\'")
                    .replace(/\\"/g, '"')
                    .replace(/(^"|"$)/g, "'")),
                  (w = k.stylize(w, 'string'))))
          }
          return w + ': ' + U
        }
        function b(k, z, G) {
          var te = k.reduce(function (W, y) {
            return (
              y.indexOf(`
`) >= 0,
              W + y.replace(/\u001b\[\d\d?m/g, '').length + 1
            )
          }, 0)
          return te > 60
            ? G[0] +
                (z === ''
                  ? ''
                  : z +
                    `
 `) +
                ' ' +
                k.join(`,
  `) +
                ' ' +
                G[1]
            : G[0] + z + ' ' + k.join(', ') + ' ' + G[1]
        }
        t.types = hm()
        function T(k) {
          return Array.isArray(k)
        }
        t.isArray = T
        function m(k) {
          return typeof k == 'boolean'
        }
        t.isBoolean = m
        function A(k) {
          return k === null
        }
        t.isNull = A
        function I(k) {
          return k == null
        }
        t.isNullOrUndefined = I
        function D(k) {
          return typeof k == 'number'
        }
        t.isNumber = D
        function L(k) {
          return typeof k == 'string'
        }
        t.isString = L
        function q(k) {
          return typeof k == 'symbol'
        }
        t.isSymbol = q
        function K(k) {
          return k === void 0
        }
        t.isUndefined = K
        function J(k) {
          return R(k) && S(k) === '[object RegExp]'
        }
        ;((t.isRegExp = J), (t.types.isRegExp = J))
        function R(k) {
          return typeof k == 'object' && k !== null
        }
        t.isObject = R
        function oe(k) {
          return R(k) && S(k) === '[object Date]'
        }
        ;((t.isDate = oe), (t.types.isDate = oe))
        function he(k) {
          return R(k) && (S(k) === '[object Error]' || k instanceof Error)
        }
        ;((t.isError = he), (t.types.isNativeError = he))
        function F(k) {
          return typeof k == 'function'
        }
        t.isFunction = F
        function V(k) {
          return (
            k === null ||
            typeof k == 'boolean' ||
            typeof k == 'number' ||
            typeof k == 'string' ||
            typeof k == 'symbol' ||
            typeof k > 'u'
          )
        }
        ;((t.isPrimitive = V), (t.isBuffer = fm()))
        function S(k) {
          return Object.prototype.toString.call(k)
        }
        function Y(k) {
          return k < 10 ? '0' + k.toString(10) : k.toString(10)
        }
        var le = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ]
        function Z() {
          var k = new Date(),
            z = [Y(k.getHours()), Y(k.getMinutes()), Y(k.getSeconds())].join(':')
          return [k.getDate(), le[k.getMonth()], z].join(' ')
        }
        ;((t.log = function () {
          console.log('%s - %s', Z(), t.format.apply(t, arguments))
        }),
          (t.inherits = Lt),
          (t._extend = function (k, z) {
            if (!z || !R(z)) return k
            for (var G = Object.keys(z), te = G.length; te--; ) k[G[te]] = z[G[te]]
            return k
          }))
        function pe(k, z) {
          return Object.prototype.hasOwnProperty.call(k, z)
        }
        var re = typeof Symbol < 'u' ? Symbol('util.promisify.custom') : void 0
        ;((t.promisify = function (z) {
          if (typeof z != 'function')
            throw new TypeError('The "original" argument must be of type Function')
          if (re && z[re]) {
            var G = z[re]
            if (typeof G != 'function')
              throw new TypeError('The "util.promisify.custom" argument must be of type Function')
            return (
              Object.defineProperty(G, re, {
                value: G,
                enumerable: !1,
                writable: !1,
                configurable: !0,
              }),
              G
            )
          }
          function G() {
            for (
              var te,
                W,
                y = new Promise(function (B, N) {
                  ;((te = B), (W = N))
                }),
                w = [],
                U = 0;
              U < arguments.length;
              U++
            )
              w.push(arguments[U])
            w.push(function (B, N) {
              B ? W(B) : te(N)
            })
            try {
              z.apply(this, w)
            } catch (B) {
              W(B)
            }
            return y
          }
          return (
            Object.setPrototypeOf(G, Object.getPrototypeOf(z)),
            re &&
              Object.defineProperty(G, re, {
                value: G,
                enumerable: !1,
                writable: !1,
                configurable: !0,
              }),
            Object.defineProperties(G, e(z))
          )
        }),
          (t.promisify.custom = re))
        function de(k, z) {
          if (!k) {
            var G = new Error('Promise was rejected with a falsy value')
            ;((G.reason = k), (k = G))
          }
          return z(k)
        }
        function j(k) {
          if (typeof k != 'function')
            throw new TypeError('The "original" argument must be of type Function')
          function z() {
            for (var G = [], te = 0; te < arguments.length; te++) G.push(arguments[te])
            var W = G.pop()
            if (typeof W != 'function')
              throw new TypeError('The last argument must be of type Function')
            var y = this,
              w = function () {
                return W.apply(y, arguments)
              }
            k.apply(this, G).then(
              function (U) {
                _e.nextTick(w.bind(null, null, U))
              },
              function (U) {
                _e.nextTick(de.bind(null, U, w))
              },
            )
          }
          return (
            Object.setPrototypeOf(z, Object.getPrototypeOf(k)), Object.defineProperties(z, e(k)), z
          )
        }
        t.callbackify = j
      })(hi)),
    hi
  )
}
var Li, ql
function dm() {
  if (ql) return Li
  ql = 1
  function t(E, d) {
    var x = Object.keys(E)
    if (Object.getOwnPropertySymbols) {
      var b = Object.getOwnPropertySymbols(E)
      ;(d &&
        (b = b.filter(function (T) {
          return Object.getOwnPropertyDescriptor(E, T).enumerable
        })),
        x.push.apply(x, b))
    }
    return x
  }
  function e(E) {
    for (var d = 1; d < arguments.length; d++) {
      var x = arguments[d] != null ? arguments[d] : {}
      d % 2
        ? t(Object(x), !0).forEach(function (b) {
            r(E, b, x[b])
          })
        : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(E, Object.getOwnPropertyDescriptors(x))
          : t(Object(x)).forEach(function (b) {
              Object.defineProperty(E, b, Object.getOwnPropertyDescriptor(x, b))
            })
    }
    return E
  }
  function r(E, d, x) {
    return (
      d in E
        ? Object.defineProperty(E, d, { value: x, enumerable: !0, configurable: !0, writable: !0 })
        : (E[d] = x),
      E
    )
  }
  function n(E, d) {
    if (!(E instanceof d)) throw new TypeError('Cannot call a class as a function')
  }
  function i(E, d) {
    for (var x = 0; x < d.length; x++) {
      var b = d[x]
      ;((b.enumerable = b.enumerable || !1),
        (b.configurable = !0),
        'value' in b && (b.writable = !0),
        Object.defineProperty(E, b.key, b))
    }
  }
  function s(E, d, x) {
    return (d && i(E.prototype, d), E)
  }
  var a = jn(),
    o = a.Buffer,
    l = ed(),
    p = l.inspect,
    g = (p && p.custom) || 'inspect'
  function v(E, d, x) {
    o.prototype.copy.call(E, d, x)
  }
  return (
    (Li = (function () {
      function E() {
        ;(n(this, E), (this.head = null), (this.tail = null), (this.length = 0))
      }
      return (
        s(E, [
          {
            key: 'push',
            value: function (x) {
              var b = { data: x, next: null }
              ;(this.length > 0 ? (this.tail.next = b) : (this.head = b),
                (this.tail = b),
                ++this.length)
            },
          },
          {
            key: 'unshift',
            value: function (x) {
              var b = { data: x, next: this.head }
              ;(this.length === 0 && (this.tail = b), (this.head = b), ++this.length)
            },
          },
          {
            key: 'shift',
            value: function () {
              if (this.length !== 0) {
                var x = this.head.data
                return (
                  this.length === 1 ? (this.head = this.tail = null) : (this.head = this.head.next),
                  --this.length,
                  x
                )
              }
            },
          },
          {
            key: 'clear',
            value: function () {
              ;((this.head = this.tail = null), (this.length = 0))
            },
          },
          {
            key: 'join',
            value: function (x) {
              if (this.length === 0) return ''
              for (var b = this.head, T = '' + b.data; (b = b.next); ) T += x + b.data
              return T
            },
          },
          {
            key: 'concat',
            value: function (x) {
              if (this.length === 0) return o.alloc(0)
              for (var b = o.allocUnsafe(x >>> 0), T = this.head, m = 0; T; )
                (v(T.data, b, m), (m += T.data.length), (T = T.next))
              return b
            },
          },
          {
            key: 'consume',
            value: function (x, b) {
              var T
              return (
                x < this.head.data.length
                  ? ((T = this.head.data.slice(0, x)), (this.head.data = this.head.data.slice(x)))
                  : x === this.head.data.length
                    ? (T = this.shift())
                    : (T = b ? this._getString(x) : this._getBuffer(x)),
                T
              )
            },
          },
          {
            key: 'first',
            value: function () {
              return this.head.data
            },
          },
          {
            key: '_getString',
            value: function (x) {
              var b = this.head,
                T = 1,
                m = b.data
              for (x -= m.length; (b = b.next); ) {
                var A = b.data,
                  I = x > A.length ? A.length : x
                if ((I === A.length ? (m += A) : (m += A.slice(0, x)), (x -= I), x === 0)) {
                  I === A.length
                    ? (++T, b.next ? (this.head = b.next) : (this.head = this.tail = null))
                    : ((this.head = b), (b.data = A.slice(I)))
                  break
                }
                ++T
              }
              return ((this.length -= T), m)
            },
          },
          {
            key: '_getBuffer',
            value: function (x) {
              var b = o.allocUnsafe(x),
                T = this.head,
                m = 1
              for (T.data.copy(b), x -= T.data.length; (T = T.next); ) {
                var A = T.data,
                  I = x > A.length ? A.length : x
                if ((A.copy(b, b.length - x, 0, I), (x -= I), x === 0)) {
                  I === A.length
                    ? (++m, T.next ? (this.head = T.next) : (this.head = this.tail = null))
                    : ((this.head = T), (T.data = A.slice(I)))
                  break
                }
                ++m
              }
              return ((this.length -= m), b)
            },
          },
          {
            key: g,
            value: function (x, b) {
              return p(this, e({}, b, { depth: 0, customInspect: !1 }))
            },
          },
        ]),
        E
      )
    })()),
    Li
  )
}
var Bi, Xl
function td() {
  if (Xl) return Bi
  Xl = 1
  function t(a, o) {
    var l = this,
      p = this._readableState && this._readableState.destroyed,
      g = this._writableState && this._writableState.destroyed
    return p || g
      ? (o
          ? o(a)
          : a &&
            (this._writableState
              ? this._writableState.errorEmitted ||
                ((this._writableState.errorEmitted = !0), _e.nextTick(i, this, a))
              : _e.nextTick(i, this, a)),
        this)
      : (this._readableState && (this._readableState.destroyed = !0),
        this._writableState && (this._writableState.destroyed = !0),
        this._destroy(a || null, function (v) {
          !o && v
            ? l._writableState
              ? l._writableState.errorEmitted
                ? _e.nextTick(r, l)
                : ((l._writableState.errorEmitted = !0), _e.nextTick(e, l, v))
              : _e.nextTick(e, l, v)
            : o
              ? (_e.nextTick(r, l), o(v))
              : _e.nextTick(r, l)
        }),
        this)
  }
  function e(a, o) {
    ;(i(a, o), r(a))
  }
  function r(a) {
    ;(a._writableState && !a._writableState.emitClose) ||
      (a._readableState && !a._readableState.emitClose) ||
      a.emit('close')
  }
  function n() {
    ;(this._readableState &&
      ((this._readableState.destroyed = !1),
      (this._readableState.reading = !1),
      (this._readableState.ended = !1),
      (this._readableState.endEmitted = !1)),
      this._writableState &&
        ((this._writableState.destroyed = !1),
        (this._writableState.ended = !1),
        (this._writableState.ending = !1),
        (this._writableState.finalCalled = !1),
        (this._writableState.prefinished = !1),
        (this._writableState.finished = !1),
        (this._writableState.errorEmitted = !1)))
  }
  function i(a, o) {
    a.emit('error', o)
  }
  function s(a, o) {
    var l = a._readableState,
      p = a._writableState
    ;(l && l.autoDestroy) || (p && p.autoDestroy) ? a.destroy(o) : a.emit('error', o)
  }
  return ((Bi = { destroy: t, undestroy: n, errorOrDestroy: s }), Bi)
}
var Pi = {},
  Yl
function mr() {
  if (Yl) return Pi
  Yl = 1
  function t(o, l) {
    ;((o.prototype = Object.create(l.prototype)), (o.prototype.constructor = o), (o.__proto__ = l))
  }
  var e = {}
  function r(o, l, p) {
    p || (p = Error)
    function g(E, d, x) {
      return typeof l == 'string' ? l : l(E, d, x)
    }
    var v = (function (E) {
      t(d, E)
      function d(x, b, T) {
        return E.call(this, g(x, b, T)) || this
      }
      return d
    })(p)
    ;((v.prototype.name = p.name), (v.prototype.code = o), (e[o] = v))
  }
  function n(o, l) {
    if (Array.isArray(o)) {
      var p = o.length
      return (
        (o = o.map(function (g) {
          return String(g)
        })),
        p > 2
          ? 'one of '.concat(l, ' ').concat(o.slice(0, p - 1).join(', '), ', or ') + o[p - 1]
          : p === 2
            ? 'one of '.concat(l, ' ').concat(o[0], ' or ').concat(o[1])
            : 'of '.concat(l, ' ').concat(o[0])
      )
    } else return 'of '.concat(l, ' ').concat(String(o))
  }
  function i(o, l, p) {
    return o.substr(0, l.length) === l
  }
  function s(o, l, p) {
    return ((p === void 0 || p > o.length) && (p = o.length), o.substring(p - l.length, p) === l)
  }
  function a(o, l, p) {
    return (typeof p != 'number' && (p = 0), p + l.length > o.length ? !1 : o.indexOf(l, p) !== -1)
  }
  return (
    r(
      'ERR_INVALID_OPT_VALUE',
      function (o, l) {
        return 'The value "' + l + '" is invalid for option "' + o + '"'
      },
      TypeError,
    ),
    r(
      'ERR_INVALID_ARG_TYPE',
      function (o, l, p) {
        var g
        typeof l == 'string' && i(l, 'not ')
          ? ((g = 'must not be'), (l = l.replace(/^not /, '')))
          : (g = 'must be')
        var v
        if (s(o, ' argument')) v = 'The '.concat(o, ' ').concat(g, ' ').concat(n(l, 'type'))
        else {
          var E = a(o, '.') ? 'property' : 'argument'
          v = 'The "'.concat(o, '" ').concat(E, ' ').concat(g, ' ').concat(n(l, 'type'))
        }
        return ((v += '. Received type '.concat(typeof p)), v)
      },
      TypeError,
    ),
    r('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF'),
    r('ERR_METHOD_NOT_IMPLEMENTED', function (o) {
      return 'The ' + o + ' method is not implemented'
    }),
    r('ERR_STREAM_PREMATURE_CLOSE', 'Premature close'),
    r('ERR_STREAM_DESTROYED', function (o) {
      return 'Cannot call ' + o + ' after a stream was destroyed'
    }),
    r('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times'),
    r('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable'),
    r('ERR_STREAM_WRITE_AFTER_END', 'write after end'),
    r('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError),
    r(
      'ERR_UNKNOWN_ENCODING',
      function (o) {
        return 'Unknown encoding: ' + o
      },
      TypeError,
    ),
    r('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event'),
    (Pi.codes = e),
    Pi
  )
}
var Ui, Zl
function rd() {
  if (Zl) return Ui
  Zl = 1
  var t = mr().codes.ERR_INVALID_OPT_VALUE
  function e(n, i, s) {
    return n.highWaterMark != null ? n.highWaterMark : i ? n[s] : null
  }
  function r(n, i, s, a) {
    var o = e(i, a, s)
    if (o != null) {
      if (!(isFinite(o) && Math.floor(o) === o) || o < 0) {
        var l = a ? s : 'highWaterMark'
        throw new t(l, o)
      }
      return Math.floor(o)
    }
    return n.objectMode ? 16 : 16 * 1024
  }
  return ((Ui = { getHighWaterMark: r }), Ui)
}
var Mi, Jl
function pm() {
  if (Jl) return Mi
  ;((Jl = 1), (Mi = t))
  function t(r, n) {
    if (e('noDeprecation')) return r
    var i = !1
    function s() {
      if (!i) {
        if (e('throwDeprecation')) throw new Error(n)
        ;(e('traceDeprecation') ? console.trace(n) : console.warn(n), (i = !0))
      }
      return r.apply(this, arguments)
    }
    return s
  }
  function e(r) {
    try {
      if (!ct.localStorage) return !1
    } catch {
      return !1
    }
    var n = ct.localStorage[r]
    return n == null ? !1 : String(n).toLowerCase() === 'true'
  }
  return Mi
}
var Hi, Ql
function nd() {
  if (Ql) return Hi
  ;((Ql = 1), (Hi = J))
  function t(W) {
    var y = this
    ;((this.next = null),
      (this.entry = null),
      (this.finish = function () {
        te(y, W)
      }))
  }
  var e
  J.WritableState = q
  var r = { deprecate: pm() },
    n = qf(),
    i = jn().Buffer,
    s = ct.Uint8Array || function () {}
  function a(W) {
    return i.from(W)
  }
  function o(W) {
    return i.isBuffer(W) || W instanceof s
  }
  var l = td(),
    p = rd(),
    g = p.getHighWaterMark,
    v = mr().codes,
    E = v.ERR_INVALID_ARG_TYPE,
    d = v.ERR_METHOD_NOT_IMPLEMENTED,
    x = v.ERR_MULTIPLE_CALLBACK,
    b = v.ERR_STREAM_CANNOT_PIPE,
    T = v.ERR_STREAM_DESTROYED,
    m = v.ERR_STREAM_NULL_VALUES,
    A = v.ERR_STREAM_WRITE_AFTER_END,
    I = v.ERR_UNKNOWN_ENCODING,
    D = l.errorOrDestroy
  Lt(J, n)
  function L() {}
  function q(W, y, w) {
    ;((e = e || nr()),
      (W = W || {}),
      typeof w != 'boolean' && (w = y instanceof e),
      (this.objectMode = !!W.objectMode),
      w && (this.objectMode = this.objectMode || !!W.writableObjectMode),
      (this.highWaterMark = g(this, W, 'writableHighWaterMark', w)),
      (this.finalCalled = !1),
      (this.needDrain = !1),
      (this.ending = !1),
      (this.ended = !1),
      (this.finished = !1),
      (this.destroyed = !1))
    var U = W.decodeStrings === !1
    ;((this.decodeStrings = !U),
      (this.defaultEncoding = W.defaultEncoding || 'utf8'),
      (this.length = 0),
      (this.writing = !1),
      (this.corked = 0),
      (this.sync = !0),
      (this.bufferProcessing = !1),
      (this.onwrite = function (B) {
        le(y, B)
      }),
      (this.writecb = null),
      (this.writelen = 0),
      (this.bufferedRequest = null),
      (this.lastBufferedRequest = null),
      (this.pendingcb = 0),
      (this.prefinished = !1),
      (this.errorEmitted = !1),
      (this.emitClose = W.emitClose !== !1),
      (this.autoDestroy = !!W.autoDestroy),
      (this.bufferedRequestCount = 0),
      (this.corkedRequestsFree = new t(this)))
  }
  ;((q.prototype.getBuffer = function () {
    for (var y = this.bufferedRequest, w = []; y; ) (w.push(y), (y = y.next))
    return w
  }),
    (function () {
      try {
        Object.defineProperty(q.prototype, 'buffer', {
          get: r.deprecate(
            function () {
              return this.getBuffer()
            },
            '_writableState.buffer is deprecated. Use _writableState.getBuffer instead.',
            'DEP0003',
          ),
        })
      } catch {}
    })())
  var K
  typeof Symbol == 'function' &&
  Symbol.hasInstance &&
  typeof Function.prototype[Symbol.hasInstance] == 'function'
    ? ((K = Function.prototype[Symbol.hasInstance]),
      Object.defineProperty(J, Symbol.hasInstance, {
        value: function (y) {
          return K.call(this, y) ? !0 : this !== J ? !1 : y && y._writableState instanceof q
        },
      }))
    : (K = function (y) {
        return y instanceof this
      })
  function J(W) {
    e = e || nr()
    var y = this instanceof e
    if (!y && !K.call(J, this)) return new J(W)
    ;((this._writableState = new q(W, this, y)),
      (this.writable = !0),
      W &&
        (typeof W.write == 'function' && (this._write = W.write),
        typeof W.writev == 'function' && (this._writev = W.writev),
        typeof W.destroy == 'function' && (this._destroy = W.destroy),
        typeof W.final == 'function' && (this._final = W.final)),
      n.call(this))
  }
  J.prototype.pipe = function () {
    D(this, new b())
  }
  function R(W, y) {
    var w = new A()
    ;(D(W, w), _e.nextTick(y, w))
  }
  function oe(W, y, w, U) {
    var B
    return (
      w === null
        ? (B = new m())
        : typeof w != 'string' && !y.objectMode && (B = new E('chunk', ['string', 'Buffer'], w)),
      B ? (D(W, B), _e.nextTick(U, B), !1) : !0
    )
  }
  ;((J.prototype.write = function (W, y, w) {
    var U = this._writableState,
      B = !1,
      N = !U.objectMode && o(W)
    return (
      N && !i.isBuffer(W) && (W = a(W)),
      typeof y == 'function' && ((w = y), (y = null)),
      N ? (y = 'buffer') : y || (y = U.defaultEncoding),
      typeof w != 'function' && (w = L),
      U.ending
        ? R(this, w)
        : (N || oe(this, U, W, w)) && (U.pendingcb++, (B = F(this, U, N, W, y, w))),
      B
    )
  }),
    (J.prototype.cork = function () {
      this._writableState.corked++
    }),
    (J.prototype.uncork = function () {
      var W = this._writableState
      W.corked &&
        (W.corked--,
        !W.writing && !W.corked && !W.bufferProcessing && W.bufferedRequest && re(this, W))
    }),
    (J.prototype.setDefaultEncoding = function (y) {
      if (
        (typeof y == 'string' && (y = y.toLowerCase()),
        !(
          [
            'hex',
            'utf8',
            'utf-8',
            'ascii',
            'binary',
            'base64',
            'ucs2',
            'ucs-2',
            'utf16le',
            'utf-16le',
            'raw',
          ].indexOf((y + '').toLowerCase()) > -1
        ))
      )
        throw new I(y)
      return ((this._writableState.defaultEncoding = y), this)
    }),
    Object.defineProperty(J.prototype, 'writableBuffer', {
      enumerable: !1,
      get: function () {
        return this._writableState && this._writableState.getBuffer()
      },
    }))
  function he(W, y, w) {
    return (
      !W.objectMode && W.decodeStrings !== !1 && typeof y == 'string' && (y = i.from(y, w)), y
    )
  }
  Object.defineProperty(J.prototype, 'writableHighWaterMark', {
    enumerable: !1,
    get: function () {
      return this._writableState.highWaterMark
    },
  })
  function F(W, y, w, U, B, N) {
    if (!w) {
      var C = he(y, U, B)
      U !== C && ((w = !0), (B = 'buffer'), (U = C))
    }
    var ee = y.objectMode ? 1 : U.length
    y.length += ee
    var f = y.length < y.highWaterMark
    if ((f || (y.needDrain = !0), y.writing || y.corked)) {
      var X = y.lastBufferedRequest
      ;((y.lastBufferedRequest = { chunk: U, encoding: B, isBuf: w, callback: N, next: null }),
        X ? (X.next = y.lastBufferedRequest) : (y.bufferedRequest = y.lastBufferedRequest),
        (y.bufferedRequestCount += 1))
    } else V(W, y, !1, ee, U, B, N)
    return f
  }
  function V(W, y, w, U, B, N, C) {
    ;((y.writelen = U),
      (y.writecb = C),
      (y.writing = !0),
      (y.sync = !0),
      y.destroyed
        ? y.onwrite(new T('write'))
        : w
          ? W._writev(B, y.onwrite)
          : W._write(B, N, y.onwrite),
      (y.sync = !1))
  }
  function S(W, y, w, U, B) {
    ;(--y.pendingcb,
      w
        ? (_e.nextTick(B, U), _e.nextTick(z, W, y), (W._writableState.errorEmitted = !0), D(W, U))
        : (B(U), (W._writableState.errorEmitted = !0), D(W, U), z(W, y)))
  }
  function Y(W) {
    ;((W.writing = !1), (W.writecb = null), (W.length -= W.writelen), (W.writelen = 0))
  }
  function le(W, y) {
    var w = W._writableState,
      U = w.sync,
      B = w.writecb
    if (typeof B != 'function') throw new x()
    if ((Y(w), y)) S(W, w, U, y, B)
    else {
      var N = de(w) || W.destroyed
      ;(!N && !w.corked && !w.bufferProcessing && w.bufferedRequest && re(W, w),
        U ? _e.nextTick(Z, W, w, N, B) : Z(W, w, N, B))
    }
  }
  function Z(W, y, w, U) {
    ;(w || pe(W, y), y.pendingcb--, U(), z(W, y))
  }
  function pe(W, y) {
    y.length === 0 && y.needDrain && ((y.needDrain = !1), W.emit('drain'))
  }
  function re(W, y) {
    y.bufferProcessing = !0
    var w = y.bufferedRequest
    if (W._writev && w && w.next) {
      var U = y.bufferedRequestCount,
        B = new Array(U),
        N = y.corkedRequestsFree
      N.entry = w
      for (var C = 0, ee = !0; w; ) ((B[C] = w), w.isBuf || (ee = !1), (w = w.next), (C += 1))
      ;((B.allBuffers = ee),
        V(W, y, !0, y.length, B, '', N.finish),
        y.pendingcb++,
        (y.lastBufferedRequest = null),
        N.next
          ? ((y.corkedRequestsFree = N.next), (N.next = null))
          : (y.corkedRequestsFree = new t(y)),
        (y.bufferedRequestCount = 0))
    } else {
      for (; w; ) {
        var f = w.chunk,
          X = w.encoding,
          _ = w.callback,
          u = y.objectMode ? 1 : f.length
        if ((V(W, y, !1, u, f, X, _), (w = w.next), y.bufferedRequestCount--, y.writing)) break
      }
      w === null && (y.lastBufferedRequest = null)
    }
    ;((y.bufferedRequest = w), (y.bufferProcessing = !1))
  }
  ;((J.prototype._write = function (W, y, w) {
    w(new d('_write()'))
  }),
    (J.prototype._writev = null),
    (J.prototype.end = function (W, y, w) {
      var U = this._writableState
      return (
        typeof W == 'function'
          ? ((w = W), (W = null), (y = null))
          : typeof y == 'function' && ((w = y), (y = null)),
        W != null && this.write(W, y),
        U.corked && ((U.corked = 1), this.uncork()),
        U.ending || G(this, U, w),
        this
      )
    }),
    Object.defineProperty(J.prototype, 'writableLength', {
      enumerable: !1,
      get: function () {
        return this._writableState.length
      },
    }))
  function de(W) {
    return W.ending && W.length === 0 && W.bufferedRequest === null && !W.finished && !W.writing
  }
  function j(W, y) {
    W._final(function (w) {
      ;(y.pendingcb--, w && D(W, w), (y.prefinished = !0), W.emit('prefinish'), z(W, y))
    })
  }
  function k(W, y) {
    !y.prefinished &&
      !y.finalCalled &&
      (typeof W._final == 'function' && !y.destroyed
        ? (y.pendingcb++, (y.finalCalled = !0), _e.nextTick(j, W, y))
        : ((y.prefinished = !0), W.emit('prefinish')))
  }
  function z(W, y) {
    var w = de(y)
    if (w && (k(W, y), y.pendingcb === 0 && ((y.finished = !0), W.emit('finish'), y.autoDestroy))) {
      var U = W._readableState
      ;(!U || (U.autoDestroy && U.endEmitted)) && W.destroy()
    }
    return w
  }
  function G(W, y, w) {
    ;((y.ending = !0),
      z(W, y),
      w && (y.finished ? _e.nextTick(w) : W.once('finish', w)),
      (y.ended = !0),
      (W.writable = !1))
  }
  function te(W, y, w) {
    var U = W.entry
    for (W.entry = null; U; ) {
      var B = U.callback
      ;(y.pendingcb--, B(w), (U = U.next))
    }
    y.corkedRequestsFree.next = W
  }
  return (
    Object.defineProperty(J.prototype, 'destroyed', {
      enumerable: !1,
      get: function () {
        return this._writableState === void 0 ? !1 : this._writableState.destroyed
      },
      set: function (y) {
        this._writableState && (this._writableState.destroyed = y)
      },
    }),
    (J.prototype.destroy = l.destroy),
    (J.prototype._undestroy = l.undestroy),
    (J.prototype._destroy = function (W, y) {
      y(W)
    }),
    Hi
  )
}
var Wi, eh
function nr() {
  if (eh) return Wi
  eh = 1
  var t =
    Object.keys ||
    function (p) {
      var g = []
      for (var v in p) g.push(v)
      return g
    }
  Wi = a
  var e = id(),
    r = nd()
  Lt(a, e)
  for (var n = t(r.prototype), i = 0; i < n.length; i++) {
    var s = n[i]
    a.prototype[s] || (a.prototype[s] = r.prototype[s])
  }
  function a(p) {
    if (!(this instanceof a)) return new a(p)
    ;(e.call(this, p),
      r.call(this, p),
      (this.allowHalfOpen = !0),
      p &&
        (p.readable === !1 && (this.readable = !1),
        p.writable === !1 && (this.writable = !1),
        p.allowHalfOpen === !1 && ((this.allowHalfOpen = !1), this.once('end', o))))
  }
  ;(Object.defineProperty(a.prototype, 'writableHighWaterMark', {
    enumerable: !1,
    get: function () {
      return this._writableState.highWaterMark
    },
  }),
    Object.defineProperty(a.prototype, 'writableBuffer', {
      enumerable: !1,
      get: function () {
        return this._writableState && this._writableState.getBuffer()
      },
    }),
    Object.defineProperty(a.prototype, 'writableLength', {
      enumerable: !1,
      get: function () {
        return this._writableState.length
      },
    }))
  function o() {
    this._writableState.ended || _e.nextTick(l, this)
  }
  function l(p) {
    p.end()
  }
  return (
    Object.defineProperty(a.prototype, 'destroyed', {
      enumerable: !1,
      get: function () {
        return this._readableState === void 0 || this._writableState === void 0
          ? !1
          : this._readableState.destroyed && this._writableState.destroyed
      },
      set: function (g) {
        this._readableState === void 0 ||
          this._writableState === void 0 ||
          ((this._readableState.destroyed = g), (this._writableState.destroyed = g))
      },
    }),
    Wi
  )
}
var zi = {},
  Xr = { exports: {} },
  th
function mm() {
  return (
    th ||
      ((th = 1),
      (function (t, e) {
        var r = jn(),
          n = r.Buffer
        function i(a, o) {
          for (var l in a) o[l] = a[l]
        }
        n.from && n.alloc && n.allocUnsafe && n.allocUnsafeSlow
          ? (t.exports = r)
          : (i(r, e), (e.Buffer = s))
        function s(a, o, l) {
          return n(a, o, l)
        }
        ;(i(n, s),
          (s.from = function (a, o, l) {
            if (typeof a == 'number') throw new TypeError('Argument must not be a number')
            return n(a, o, l)
          }),
          (s.alloc = function (a, o, l) {
            if (typeof a != 'number') throw new TypeError('Argument must be a number')
            var p = n(a)
            return (o !== void 0 ? (typeof l == 'string' ? p.fill(o, l) : p.fill(o)) : p.fill(0), p)
          }),
          (s.allocUnsafe = function (a) {
            if (typeof a != 'number') throw new TypeError('Argument must be a number')
            return n(a)
          }),
          (s.allocUnsafeSlow = function (a) {
            if (typeof a != 'number') throw new TypeError('Argument must be a number')
            return r.SlowBuffer(a)
          }))
      })(Xr, Xr.exports)),
    Xr.exports
  )
}
var rh
function as() {
  if (rh) return zi
  rh = 1
  var t = mm().Buffer,
    e =
      t.isEncoding ||
      function (m) {
        switch (((m = '' + m), m && m.toLowerCase())) {
          case 'hex':
          case 'utf8':
          case 'utf-8':
          case 'ascii':
          case 'binary':
          case 'base64':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
          case 'raw':
            return !0
          default:
            return !1
        }
      }
  function r(m) {
    if (!m) return 'utf8'
    for (var A; ; )
      switch (m) {
        case 'utf8':
        case 'utf-8':
          return 'utf8'
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return 'utf16le'
        case 'latin1':
        case 'binary':
          return 'latin1'
        case 'base64':
        case 'ascii':
        case 'hex':
          return m
        default:
          if (A) return
          ;((m = ('' + m).toLowerCase()), (A = !0))
      }
  }
  function n(m) {
    var A = r(m)
    if (typeof A != 'string' && (t.isEncoding === e || !e(m)))
      throw new Error('Unknown encoding: ' + m)
    return A || m
  }
  zi.StringDecoder = i
  function i(m) {
    this.encoding = n(m)
    var A
    switch (this.encoding) {
      case 'utf16le':
        ;((this.text = v), (this.end = E), (A = 4))
        break
      case 'utf8':
        ;((this.fillLast = l), (A = 4))
        break
      case 'base64':
        ;((this.text = d), (this.end = x), (A = 3))
        break
      default:
        ;((this.write = b), (this.end = T))
        return
    }
    ;((this.lastNeed = 0), (this.lastTotal = 0), (this.lastChar = t.allocUnsafe(A)))
  }
  ;((i.prototype.write = function (m) {
    if (m.length === 0) return ''
    var A, I
    if (this.lastNeed) {
      if (((A = this.fillLast(m)), A === void 0)) return ''
      ;((I = this.lastNeed), (this.lastNeed = 0))
    } else I = 0
    return I < m.length ? (A ? A + this.text(m, I) : this.text(m, I)) : A || ''
  }),
    (i.prototype.end = g),
    (i.prototype.text = p),
    (i.prototype.fillLast = function (m) {
      if (this.lastNeed <= m.length)
        return (
          m.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed),
          this.lastChar.toString(this.encoding, 0, this.lastTotal)
        )
      ;(m.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, m.length),
        (this.lastNeed -= m.length))
    }))
  function s(m) {
    return m <= 127
      ? 0
      : m >> 5 === 6
        ? 2
        : m >> 4 === 14
          ? 3
          : m >> 3 === 30
            ? 4
            : m >> 6 === 2
              ? -1
              : -2
  }
  function a(m, A, I) {
    var D = A.length - 1
    if (D < I) return 0
    var L = s(A[D])
    return L >= 0
      ? (L > 0 && (m.lastNeed = L - 1), L)
      : --D < I || L === -2
        ? 0
        : ((L = s(A[D])),
          L >= 0
            ? (L > 0 && (m.lastNeed = L - 2), L)
            : --D < I || L === -2
              ? 0
              : ((L = s(A[D])),
                L >= 0 ? (L > 0 && (L === 2 ? (L = 0) : (m.lastNeed = L - 3)), L) : 0))
  }
  function o(m, A, I) {
    if ((A[0] & 192) !== 128) return ((m.lastNeed = 0), '\uFFFD')
    if (m.lastNeed > 1 && A.length > 1) {
      if ((A[1] & 192) !== 128) return ((m.lastNeed = 1), '\uFFFD')
      if (m.lastNeed > 2 && A.length > 2 && (A[2] & 192) !== 128)
        return ((m.lastNeed = 2), '\uFFFD')
    }
  }
  function l(m) {
    var A = this.lastTotal - this.lastNeed,
      I = o(this, m)
    if (I !== void 0) return I
    if (this.lastNeed <= m.length)
      return (
        m.copy(this.lastChar, A, 0, this.lastNeed),
        this.lastChar.toString(this.encoding, 0, this.lastTotal)
      )
    ;(m.copy(this.lastChar, A, 0, m.length), (this.lastNeed -= m.length))
  }
  function p(m, A) {
    var I = a(this, m, A)
    if (!this.lastNeed) return m.toString('utf8', A)
    this.lastTotal = I
    var D = m.length - (I - this.lastNeed)
    return (m.copy(this.lastChar, 0, D), m.toString('utf8', A, D))
  }
  function g(m) {
    var A = m && m.length ? this.write(m) : ''
    return this.lastNeed ? A + '\uFFFD' : A
  }
  function v(m, A) {
    if ((m.length - A) % 2 === 0) {
      var I = m.toString('utf16le', A)
      if (I) {
        var D = I.charCodeAt(I.length - 1)
        if (D >= 55296 && D <= 56319)
          return (
            (this.lastNeed = 2),
            (this.lastTotal = 4),
            (this.lastChar[0] = m[m.length - 2]),
            (this.lastChar[1] = m[m.length - 1]),
            I.slice(0, -1)
          )
      }
      return I
    }
    return (
      (this.lastNeed = 1),
      (this.lastTotal = 2),
      (this.lastChar[0] = m[m.length - 1]),
      m.toString('utf16le', A, m.length - 1)
    )
  }
  function E(m) {
    var A = m && m.length ? this.write(m) : ''
    if (this.lastNeed) {
      var I = this.lastTotal - this.lastNeed
      return A + this.lastChar.toString('utf16le', 0, I)
    }
    return A
  }
  function d(m, A) {
    var I = (m.length - A) % 3
    return I === 0
      ? m.toString('base64', A)
      : ((this.lastNeed = 3 - I),
        (this.lastTotal = 3),
        I === 1
          ? (this.lastChar[0] = m[m.length - 1])
          : ((this.lastChar[0] = m[m.length - 2]), (this.lastChar[1] = m[m.length - 1])),
        m.toString('base64', A, m.length - I))
  }
  function x(m) {
    var A = m && m.length ? this.write(m) : ''
    return this.lastNeed ? A + this.lastChar.toString('base64', 0, 3 - this.lastNeed) : A
  }
  function b(m) {
    return m.toString(this.encoding)
  }
  function T(m) {
    return m && m.length ? this.write(m) : ''
  }
  return zi
}
var ji, nh
function Hc() {
  if (nh) return ji
  nh = 1
  var t = mr().codes.ERR_STREAM_PREMATURE_CLOSE
  function e(s) {
    var a = !1
    return function () {
      if (!a) {
        a = !0
        for (var o = arguments.length, l = new Array(o), p = 0; p < o; p++) l[p] = arguments[p]
        s.apply(this, l)
      }
    }
  }
  function r() {}
  function n(s) {
    return s.setHeader && typeof s.abort == 'function'
  }
  function i(s, a, o) {
    if (typeof a == 'function') return i(s, null, a)
    ;(a || (a = {}), (o = e(o || r)))
    var l = a.readable || (a.readable !== !1 && s.readable),
      p = a.writable || (a.writable !== !1 && s.writable),
      g = function () {
        s.writable || E()
      },
      v = s._writableState && s._writableState.finished,
      E = function () {
        ;((p = !1), (v = !0), l || o.call(s))
      },
      d = s._readableState && s._readableState.endEmitted,
      x = function () {
        ;((l = !1), (d = !0), p || o.call(s))
      },
      b = function (I) {
        o.call(s, I)
      },
      T = function () {
        var I
        if (l && !d)
          return ((!s._readableState || !s._readableState.ended) && (I = new t()), o.call(s, I))
        if (p && !v)
          return ((!s._writableState || !s._writableState.ended) && (I = new t()), o.call(s, I))
      },
      m = function () {
        s.req.on('finish', E)
      }
    return (
      n(s)
        ? (s.on('complete', E), s.on('abort', T), s.req ? m() : s.on('request', m))
        : p && !s._writableState && (s.on('end', g), s.on('close', g)),
      s.on('end', x),
      s.on('finish', E),
      a.error !== !1 && s.on('error', b),
      s.on('close', T),
      function () {
        ;(s.removeListener('complete', E),
          s.removeListener('abort', T),
          s.removeListener('request', m),
          s.req && s.req.removeListener('finish', E),
          s.removeListener('end', g),
          s.removeListener('close', g),
          s.removeListener('finish', E),
          s.removeListener('end', x),
          s.removeListener('error', b),
          s.removeListener('close', T))
      }
    )
  }
  return ((ji = i), ji)
}
var Gi, ih
function wm() {
  if (ih) return Gi
  ih = 1
  var t
  function e(m, A, I) {
    return (
      A in m
        ? Object.defineProperty(m, A, { value: I, enumerable: !0, configurable: !0, writable: !0 })
        : (m[A] = I),
      m
    )
  }
  var r = Hc(),
    n = Symbol('lastResolve'),
    i = Symbol('lastReject'),
    s = Symbol('error'),
    a = Symbol('ended'),
    o = Symbol('lastPromise'),
    l = Symbol('handlePromise'),
    p = Symbol('stream')
  function g(m, A) {
    return { value: m, done: A }
  }
  function v(m) {
    var A = m[n]
    if (A !== null) {
      var I = m[p].read()
      I !== null && ((m[o] = null), (m[n] = null), (m[i] = null), A(g(I, !1)))
    }
  }
  function E(m) {
    _e.nextTick(v, m)
  }
  function d(m, A) {
    return function (I, D) {
      m.then(function () {
        if (A[a]) {
          I(g(void 0, !0))
          return
        }
        A[l](I, D)
      }, D)
    }
  }
  var x = Object.getPrototypeOf(function () {}),
    b = Object.setPrototypeOf(
      ((t = {
        get stream() {
          return this[p]
        },
        next: function () {
          var A = this,
            I = this[s]
          if (I !== null) return Promise.reject(I)
          if (this[a]) return Promise.resolve(g(void 0, !0))
          if (this[p].destroyed)
            return new Promise(function (K, J) {
              _e.nextTick(function () {
                A[s] ? J(A[s]) : K(g(void 0, !0))
              })
            })
          var D = this[o],
            L
          if (D) L = new Promise(d(D, this))
          else {
            var q = this[p].read()
            if (q !== null) return Promise.resolve(g(q, !1))
            L = new Promise(this[l])
          }
          return ((this[o] = L), L)
        },
      }),
      e(t, Symbol.asyncIterator, function () {
        return this
      }),
      e(t, 'return', function () {
        var A = this
        return new Promise(function (I, D) {
          A[p].destroy(null, function (L) {
            if (L) {
              D(L)
              return
            }
            I(g(void 0, !0))
          })
        })
      }),
      t),
      x,
    ),
    T = function (A) {
      var I,
        D = Object.create(
          b,
          ((I = {}),
          e(I, p, { value: A, writable: !0 }),
          e(I, n, { value: null, writable: !0 }),
          e(I, i, { value: null, writable: !0 }),
          e(I, s, { value: null, writable: !0 }),
          e(I, a, { value: A._readableState.endEmitted, writable: !0 }),
          e(I, l, {
            value: function (q, K) {
              var J = D[p].read()
              J
                ? ((D[o] = null), (D[n] = null), (D[i] = null), q(g(J, !1)))
                : ((D[n] = q), (D[i] = K))
            },
            writable: !0,
          }),
          I),
        )
      return (
        (D[o] = null),
        r(A, function (L) {
          if (L && L.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
            var q = D[i]
            ;(q !== null && ((D[o] = null), (D[n] = null), (D[i] = null), q(L)), (D[s] = L))
            return
          }
          var K = D[n]
          ;(K !== null && ((D[o] = null), (D[n] = null), (D[i] = null), K(g(void 0, !0))),
            (D[a] = !0))
        }),
        A.on('readable', E.bind(null, D)),
        D
      )
    }
  return ((Gi = T), Gi)
}
var Ki, sh
function gm() {
  return (
    sh ||
      ((sh = 1),
      (Ki = function () {
        throw new Error('Readable.from is not available in the browser')
      })),
    Ki
  )
}
var $i, oh
function id() {
  if (oh) return $i
  ;((oh = 1), ($i = R))
  var t
  ;((R.ReadableState = J), Bc.EventEmitter)
  var e = function (C, ee) {
      return C.listeners(ee).length
    },
    r = qf(),
    n = jn().Buffer,
    i = ct.Uint8Array || function () {}
  function s(N) {
    return n.from(N)
  }
  function a(N) {
    return n.isBuffer(N) || N instanceof i
  }
  var o = ed(),
    l
  o && o.debuglog ? (l = o.debuglog('stream')) : (l = function () {})
  var p = dm(),
    g = td(),
    v = rd(),
    E = v.getHighWaterMark,
    d = mr().codes,
    x = d.ERR_INVALID_ARG_TYPE,
    b = d.ERR_STREAM_PUSH_AFTER_EOF,
    T = d.ERR_METHOD_NOT_IMPLEMENTED,
    m = d.ERR_STREAM_UNSHIFT_AFTER_END_EVENT,
    A,
    I,
    D
  Lt(R, r)
  var L = g.errorOrDestroy,
    q = ['error', 'close', 'destroy', 'pause', 'resume']
  function K(N, C, ee) {
    if (typeof N.prependListener == 'function') return N.prependListener(C, ee)
    !N._events || !N._events[C]
      ? N.on(C, ee)
      : Array.isArray(N._events[C])
        ? N._events[C].unshift(ee)
        : (N._events[C] = [ee, N._events[C]])
  }
  function J(N, C, ee) {
    ;((t = t || nr()),
      (N = N || {}),
      typeof ee != 'boolean' && (ee = C instanceof t),
      (this.objectMode = !!N.objectMode),
      ee && (this.objectMode = this.objectMode || !!N.readableObjectMode),
      (this.highWaterMark = E(this, N, 'readableHighWaterMark', ee)),
      (this.buffer = new p()),
      (this.length = 0),
      (this.pipes = null),
      (this.pipesCount = 0),
      (this.flowing = null),
      (this.ended = !1),
      (this.endEmitted = !1),
      (this.reading = !1),
      (this.sync = !0),
      (this.needReadable = !1),
      (this.emittedReadable = !1),
      (this.readableListening = !1),
      (this.resumeScheduled = !1),
      (this.paused = !0),
      (this.emitClose = N.emitClose !== !1),
      (this.autoDestroy = !!N.autoDestroy),
      (this.destroyed = !1),
      (this.defaultEncoding = N.defaultEncoding || 'utf8'),
      (this.awaitDrain = 0),
      (this.readingMore = !1),
      (this.decoder = null),
      (this.encoding = null),
      N.encoding &&
        (A || (A = as().StringDecoder),
        (this.decoder = new A(N.encoding)),
        (this.encoding = N.encoding)))
  }
  function R(N) {
    if (((t = t || nr()), !(this instanceof R))) return new R(N)
    var C = this instanceof t
    ;((this._readableState = new J(N, this, C)),
      (this.readable = !0),
      N &&
        (typeof N.read == 'function' && (this._read = N.read),
        typeof N.destroy == 'function' && (this._destroy = N.destroy)),
      r.call(this))
  }
  ;(Object.defineProperty(R.prototype, 'destroyed', {
    enumerable: !1,
    get: function () {
      return this._readableState === void 0 ? !1 : this._readableState.destroyed
    },
    set: function (C) {
      this._readableState && (this._readableState.destroyed = C)
    },
  }),
    (R.prototype.destroy = g.destroy),
    (R.prototype._undestroy = g.undestroy),
    (R.prototype._destroy = function (N, C) {
      C(N)
    }),
    (R.prototype.push = function (N, C) {
      var ee = this._readableState,
        f
      return (
        ee.objectMode
          ? (f = !0)
          : typeof N == 'string' &&
            ((C = C || ee.defaultEncoding),
            C !== ee.encoding && ((N = n.from(N, C)), (C = '')),
            (f = !0)),
        oe(this, N, C, !1, f)
      )
    }),
    (R.prototype.unshift = function (N) {
      return oe(this, N, null, !0, !1)
    }))
  function oe(N, C, ee, f, X) {
    l('readableAddChunk', C)
    var _ = N._readableState
    if (C === null) ((_.reading = !1), le(N, _))
    else {
      var u
      if ((X || (u = F(_, C)), u)) L(N, u)
      else if (_.objectMode || (C && C.length > 0))
        if (
          (typeof C != 'string' &&
            !_.objectMode &&
            Object.getPrototypeOf(C) !== n.prototype &&
            (C = s(C)),
          f)
        )
          _.endEmitted ? L(N, new m()) : he(N, _, C, !0)
        else if (_.ended) L(N, new b())
        else {
          if (_.destroyed) return !1
          ;((_.reading = !1),
            _.decoder && !ee
              ? ((C = _.decoder.write(C)),
                _.objectMode || C.length !== 0 ? he(N, _, C, !1) : re(N, _))
              : he(N, _, C, !1))
        }
      else f || ((_.reading = !1), re(N, _))
    }
    return !_.ended && (_.length < _.highWaterMark || _.length === 0)
  }
  function he(N, C, ee, f) {
    ;(C.flowing && C.length === 0 && !C.sync
      ? ((C.awaitDrain = 0), N.emit('data', ee))
      : ((C.length += C.objectMode ? 1 : ee.length),
        f ? C.buffer.unshift(ee) : C.buffer.push(ee),
        C.needReadable && Z(N)),
      re(N, C))
  }
  function F(N, C) {
    var ee
    return (
      !a(C) &&
        typeof C != 'string' &&
        C !== void 0 &&
        !N.objectMode &&
        (ee = new x('chunk', ['string', 'Buffer', 'Uint8Array'], C)),
      ee
    )
  }
  ;((R.prototype.isPaused = function () {
    return this._readableState.flowing === !1
  }),
    (R.prototype.setEncoding = function (N) {
      A || (A = as().StringDecoder)
      var C = new A(N)
      ;((this._readableState.decoder = C),
        (this._readableState.encoding = this._readableState.decoder.encoding))
      for (var ee = this._readableState.buffer.head, f = ''; ee !== null; )
        ((f += C.write(ee.data)), (ee = ee.next))
      return (
        this._readableState.buffer.clear(),
        f !== '' && this._readableState.buffer.push(f),
        (this._readableState.length = f.length),
        this
      )
    }))
  var V = 1073741824
  function S(N) {
    return (
      N >= V
        ? (N = V)
        : (N--,
          (N |= N >>> 1),
          (N |= N >>> 2),
          (N |= N >>> 4),
          (N |= N >>> 8),
          (N |= N >>> 16),
          N++),
      N
    )
  }
  function Y(N, C) {
    return N <= 0 || (C.length === 0 && C.ended)
      ? 0
      : C.objectMode
        ? 1
        : N !== N
          ? C.flowing && C.length
            ? C.buffer.head.data.length
            : C.length
          : (N > C.highWaterMark && (C.highWaterMark = S(N)),
            N <= C.length ? N : C.ended ? C.length : ((C.needReadable = !0), 0))
  }
  R.prototype.read = function (N) {
    ;(l('read', N), (N = parseInt(N, 10)))
    var C = this._readableState,
      ee = N
    if (
      (N !== 0 && (C.emittedReadable = !1),
      N === 0 &&
        C.needReadable &&
        ((C.highWaterMark !== 0 ? C.length >= C.highWaterMark : C.length > 0) || C.ended))
    )
      return (
        l('read: emitReadable', C.length, C.ended),
        C.length === 0 && C.ended ? w(this) : Z(this),
        null
      )
    if (((N = Y(N, C)), N === 0 && C.ended)) return (C.length === 0 && w(this), null)
    var f = C.needReadable
    ;(l('need readable', f),
      (C.length === 0 || C.length - N < C.highWaterMark) &&
        ((f = !0), l('length less than watermark', f)),
      C.ended || C.reading
        ? ((f = !1), l('reading or ended', f))
        : f &&
          (l('do read'),
          (C.reading = !0),
          (C.sync = !0),
          C.length === 0 && (C.needReadable = !0),
          this._read(C.highWaterMark),
          (C.sync = !1),
          C.reading || (N = Y(ee, C))))
    var X
    return (
      N > 0 ? (X = y(N, C)) : (X = null),
      X === null
        ? ((C.needReadable = C.length <= C.highWaterMark), (N = 0))
        : ((C.length -= N), (C.awaitDrain = 0)),
      C.length === 0 && (C.ended || (C.needReadable = !0), ee !== N && C.ended && w(this)),
      X !== null && this.emit('data', X),
      X
    )
  }
  function le(N, C) {
    if ((l('onEofChunk'), !C.ended)) {
      if (C.decoder) {
        var ee = C.decoder.end()
        ee && ee.length && (C.buffer.push(ee), (C.length += C.objectMode ? 1 : ee.length))
      }
      ;((C.ended = !0),
        C.sync
          ? Z(N)
          : ((C.needReadable = !1), C.emittedReadable || ((C.emittedReadable = !0), pe(N))))
    }
  }
  function Z(N) {
    var C = N._readableState
    ;(l('emitReadable', C.needReadable, C.emittedReadable),
      (C.needReadable = !1),
      C.emittedReadable ||
        (l('emitReadable', C.flowing), (C.emittedReadable = !0), _e.nextTick(pe, N)))
  }
  function pe(N) {
    var C = N._readableState
    ;(l('emitReadable_', C.destroyed, C.length, C.ended),
      !C.destroyed && (C.length || C.ended) && (N.emit('readable'), (C.emittedReadable = !1)),
      (C.needReadable = !C.flowing && !C.ended && C.length <= C.highWaterMark),
      W(N))
  }
  function re(N, C) {
    C.readingMore || ((C.readingMore = !0), _e.nextTick(de, N, C))
  }
  function de(N, C) {
    for (
      ;
      !C.reading && !C.ended && (C.length < C.highWaterMark || (C.flowing && C.length === 0));
    ) {
      var ee = C.length
      if ((l('maybeReadMore read 0'), N.read(0), ee === C.length)) break
    }
    C.readingMore = !1
  }
  ;((R.prototype._read = function (N) {
    L(this, new T('_read()'))
  }),
    (R.prototype.pipe = function (N, C) {
      var ee = this,
        f = this._readableState
      switch (f.pipesCount) {
        case 0:
          f.pipes = N
          break
        case 1:
          f.pipes = [f.pipes, N]
          break
        default:
          f.pipes.push(N)
          break
      }
      ;((f.pipesCount += 1), l('pipe count=%d opts=%j', f.pipesCount, C))
      var X = (!C || C.end !== !1) && N !== _e.stdout && N !== _e.stderr,
        _ = X ? c : fe
      ;(f.endEmitted ? _e.nextTick(_) : ee.once('end', _), N.on('unpipe', u))
      function u(me, we) {
        ;(l('onunpipe'), me === ee && we && we.hasUnpiped === !1 && ((we.hasUnpiped = !0), H()))
      }
      function c() {
        ;(l('onend'), N.end())
      }
      var h = j(ee)
      N.on('drain', h)
      var O = !1
      function H() {
        ;(l('cleanup'),
          N.removeListener('close', ue),
          N.removeListener('finish', se),
          N.removeListener('drain', h),
          N.removeListener('error', ne),
          N.removeListener('unpipe', u),
          ee.removeListener('end', c),
          ee.removeListener('end', fe),
          ee.removeListener('data', P),
          (O = !0),
          f.awaitDrain && (!N._writableState || N._writableState.needDrain) && h())
      }
      ee.on('data', P)
      function P(me) {
        l('ondata')
        var we = N.write(me)
        ;(l('dest.write', we),
          we === !1 &&
            (((f.pipesCount === 1 && f.pipes === N) ||
              (f.pipesCount > 1 && B(f.pipes, N) !== -1)) &&
              !O &&
              (l('false write response, pause', f.awaitDrain), f.awaitDrain++),
            ee.pause()))
      }
      function ne(me) {
        ;(l('onerror', me), fe(), N.removeListener('error', ne), e(N, 'error') === 0 && L(N, me))
      }
      K(N, 'error', ne)
      function ue() {
        ;(N.removeListener('finish', se), fe())
      }
      N.once('close', ue)
      function se() {
        ;(l('onfinish'), N.removeListener('close', ue), fe())
      }
      N.once('finish', se)
      function fe() {
        ;(l('unpipe'), ee.unpipe(N))
      }
      return (N.emit('pipe', ee), f.flowing || (l('pipe resume'), ee.resume()), N)
    }))
  function j(N) {
    return function () {
      var ee = N._readableState
      ;(l('pipeOnDrain', ee.awaitDrain),
        ee.awaitDrain && ee.awaitDrain--,
        ee.awaitDrain === 0 && e(N, 'data') && ((ee.flowing = !0), W(N)))
    }
  }
  ;((R.prototype.unpipe = function (N) {
    var C = this._readableState,
      ee = { hasUnpiped: !1 }
    if (C.pipesCount === 0) return this
    if (C.pipesCount === 1)
      return N && N !== C.pipes
        ? this
        : (N || (N = C.pipes),
          (C.pipes = null),
          (C.pipesCount = 0),
          (C.flowing = !1),
          N && N.emit('unpipe', this, ee),
          this)
    if (!N) {
      var f = C.pipes,
        X = C.pipesCount
      ;((C.pipes = null), (C.pipesCount = 0), (C.flowing = !1))
      for (var _ = 0; _ < X; _++) f[_].emit('unpipe', this, { hasUnpiped: !1 })
      return this
    }
    var u = B(C.pipes, N)
    return u === -1
      ? this
      : (C.pipes.splice(u, 1),
        (C.pipesCount -= 1),
        C.pipesCount === 1 && (C.pipes = C.pipes[0]),
        N.emit('unpipe', this, ee),
        this)
  }),
    (R.prototype.on = function (N, C) {
      var ee = r.prototype.on.call(this, N, C),
        f = this._readableState
      return (
        N === 'data'
          ? ((f.readableListening = this.listenerCount('readable') > 0),
            f.flowing !== !1 && this.resume())
          : N === 'readable' &&
            !f.endEmitted &&
            !f.readableListening &&
            ((f.readableListening = f.needReadable = !0),
            (f.flowing = !1),
            (f.emittedReadable = !1),
            l('on readable', f.length, f.reading),
            f.length ? Z(this) : f.reading || _e.nextTick(z, this)),
        ee
      )
    }),
    (R.prototype.addListener = R.prototype.on),
    (R.prototype.removeListener = function (N, C) {
      var ee = r.prototype.removeListener.call(this, N, C)
      return (N === 'readable' && _e.nextTick(k, this), ee)
    }),
    (R.prototype.removeAllListeners = function (N) {
      var C = r.prototype.removeAllListeners.apply(this, arguments)
      return ((N === 'readable' || N === void 0) && _e.nextTick(k, this), C)
    }))
  function k(N) {
    var C = N._readableState
    ;((C.readableListening = N.listenerCount('readable') > 0),
      C.resumeScheduled && !C.paused ? (C.flowing = !0) : N.listenerCount('data') > 0 && N.resume())
  }
  function z(N) {
    ;(l('readable nexttick read 0'), N.read(0))
  }
  R.prototype.resume = function () {
    var N = this._readableState
    return (
      N.flowing || (l('resume'), (N.flowing = !N.readableListening), G(this, N)),
      (N.paused = !1),
      this
    )
  }
  function G(N, C) {
    C.resumeScheduled || ((C.resumeScheduled = !0), _e.nextTick(te, N, C))
  }
  function te(N, C) {
    ;(l('resume', C.reading),
      C.reading || N.read(0),
      (C.resumeScheduled = !1),
      N.emit('resume'),
      W(N),
      C.flowing && !C.reading && N.read(0))
  }
  R.prototype.pause = function () {
    return (
      l('call pause flowing=%j', this._readableState.flowing),
      this._readableState.flowing !== !1 &&
        (l('pause'), (this._readableState.flowing = !1), this.emit('pause')),
      (this._readableState.paused = !0),
      this
    )
  }
  function W(N) {
    var C = N._readableState
    for (l('flow', C.flowing); C.flowing && N.read() !== null; );
  }
  ;((R.prototype.wrap = function (N) {
    var C = this,
      ee = this._readableState,
      f = !1
    ;(N.on('end', function () {
      if ((l('wrapped end'), ee.decoder && !ee.ended)) {
        var u = ee.decoder.end()
        u && u.length && C.push(u)
      }
      C.push(null)
    }),
      N.on('data', function (u) {
        if (
          (l('wrapped data'),
          ee.decoder && (u = ee.decoder.write(u)),
          !(ee.objectMode && u == null) && !(!ee.objectMode && (!u || !u.length)))
        ) {
          var c = C.push(u)
          c || ((f = !0), N.pause())
        }
      }))
    for (var X in N)
      this[X] === void 0 &&
        typeof N[X] == 'function' &&
        (this[X] = (function (c) {
          return function () {
            return N[c].apply(N, arguments)
          }
        })(X))
    for (var _ = 0; _ < q.length; _++) N.on(q[_], this.emit.bind(this, q[_]))
    return (
      (this._read = function (u) {
        ;(l('wrapped _read', u), f && ((f = !1), N.resume()))
      }),
      this
    )
  }),
    typeof Symbol == 'function' &&
      (R.prototype[Symbol.asyncIterator] = function () {
        return (I === void 0 && (I = wm()), I(this))
      }),
    Object.defineProperty(R.prototype, 'readableHighWaterMark', {
      enumerable: !1,
      get: function () {
        return this._readableState.highWaterMark
      },
    }),
    Object.defineProperty(R.prototype, 'readableBuffer', {
      enumerable: !1,
      get: function () {
        return this._readableState && this._readableState.buffer
      },
    }),
    Object.defineProperty(R.prototype, 'readableFlowing', {
      enumerable: !1,
      get: function () {
        return this._readableState.flowing
      },
      set: function (C) {
        this._readableState && (this._readableState.flowing = C)
      },
    }),
    (R._fromList = y),
    Object.defineProperty(R.prototype, 'readableLength', {
      enumerable: !1,
      get: function () {
        return this._readableState.length
      },
    }))
  function y(N, C) {
    if (C.length === 0) return null
    var ee
    return (
      C.objectMode
        ? (ee = C.buffer.shift())
        : !N || N >= C.length
          ? (C.decoder
              ? (ee = C.buffer.join(''))
              : C.buffer.length === 1
                ? (ee = C.buffer.first())
                : (ee = C.buffer.concat(C.length)),
            C.buffer.clear())
          : (ee = C.buffer.consume(N, C.decoder)),
      ee
    )
  }
  function w(N) {
    var C = N._readableState
    ;(l('endReadable', C.endEmitted), C.endEmitted || ((C.ended = !0), _e.nextTick(U, C, N)))
  }
  function U(N, C) {
    if (
      (l('endReadableNT', N.endEmitted, N.length),
      !N.endEmitted &&
        N.length === 0 &&
        ((N.endEmitted = !0), (C.readable = !1), C.emit('end'), N.autoDestroy))
    ) {
      var ee = C._writableState
      ;(!ee || (ee.autoDestroy && ee.finished)) && C.destroy()
    }
  }
  typeof Symbol == 'function' &&
    (R.from = function (N, C) {
      return (D === void 0 && (D = gm()), D(R, N, C))
    })
  function B(N, C) {
    for (var ee = 0, f = N.length; ee < f; ee++) if (N[ee] === C) return ee
    return -1
  }
  return $i
}
var Vi, ah
function sd() {
  if (ah) return Vi
  ;((ah = 1), (Vi = o))
  var t = mr().codes,
    e = t.ERR_METHOD_NOT_IMPLEMENTED,
    r = t.ERR_MULTIPLE_CALLBACK,
    n = t.ERR_TRANSFORM_ALREADY_TRANSFORMING,
    i = t.ERR_TRANSFORM_WITH_LENGTH_0,
    s = nr()
  Lt(o, s)
  function a(g, v) {
    var E = this._transformState
    E.transforming = !1
    var d = E.writecb
    if (d === null) return this.emit('error', new r())
    ;((E.writechunk = null), (E.writecb = null), v != null && this.push(v), d(g))
    var x = this._readableState
    ;((x.reading = !1),
      (x.needReadable || x.length < x.highWaterMark) && this._read(x.highWaterMark))
  }
  function o(g) {
    if (!(this instanceof o)) return new o(g)
    ;(s.call(this, g),
      (this._transformState = {
        afterTransform: a.bind(this),
        needTransform: !1,
        transforming: !1,
        writecb: null,
        writechunk: null,
        writeencoding: null,
      }),
      (this._readableState.needReadable = !0),
      (this._readableState.sync = !1),
      g &&
        (typeof g.transform == 'function' && (this._transform = g.transform),
        typeof g.flush == 'function' && (this._flush = g.flush)),
      this.on('prefinish', l))
  }
  function l() {
    var g = this
    typeof this._flush == 'function' && !this._readableState.destroyed
      ? this._flush(function (v, E) {
          p(g, v, E)
        })
      : p(this, null, null)
  }
  ;((o.prototype.push = function (g, v) {
    return ((this._transformState.needTransform = !1), s.prototype.push.call(this, g, v))
  }),
    (o.prototype._transform = function (g, v, E) {
      E(new e('_transform()'))
    }),
    (o.prototype._write = function (g, v, E) {
      var d = this._transformState
      if (((d.writecb = E), (d.writechunk = g), (d.writeencoding = v), !d.transforming)) {
        var x = this._readableState
        ;(d.needTransform || x.needReadable || x.length < x.highWaterMark) &&
          this._read(x.highWaterMark)
      }
    }),
    (o.prototype._read = function (g) {
      var v = this._transformState
      v.writechunk !== null && !v.transforming
        ? ((v.transforming = !0), this._transform(v.writechunk, v.writeencoding, v.afterTransform))
        : (v.needTransform = !0)
    }),
    (o.prototype._destroy = function (g, v) {
      s.prototype._destroy.call(this, g, function (E) {
        v(E)
      })
    }))
  function p(g, v, E) {
    if (v) return g.emit('error', v)
    if ((E != null && g.push(E), g._writableState.length)) throw new i()
    if (g._transformState.transforming) throw new n()
    return g.push(null)
  }
  return Vi
}
var qi, uh
function ym() {
  if (uh) return qi
  ;((uh = 1), (qi = e))
  var t = sd()
  Lt(e, t)
  function e(r) {
    if (!(this instanceof e)) return new e(r)
    t.call(this, r)
  }
  return (
    (e.prototype._transform = function (r, n, i) {
      i(null, r)
    }),
    qi
  )
}
var Xi, ch
function vm() {
  if (ch) return Xi
  ch = 1
  var t
  function e(E) {
    var d = !1
    return function () {
      d || ((d = !0), E.apply(void 0, arguments))
    }
  }
  var r = mr().codes,
    n = r.ERR_MISSING_ARGS,
    i = r.ERR_STREAM_DESTROYED
  function s(E) {
    if (E) throw E
  }
  function a(E) {
    return E.setHeader && typeof E.abort == 'function'
  }
  function o(E, d, x, b) {
    b = e(b)
    var T = !1
    ;(E.on('close', function () {
      T = !0
    }),
      t === void 0 && (t = Hc()),
      t(E, { readable: d, writable: x }, function (A) {
        if (A) return b(A)
        ;((T = !0), b())
      }))
    var m = !1
    return function (A) {
      if (!T && !m) {
        if (((m = !0), a(E))) return E.abort()
        if (typeof E.destroy == 'function') return E.destroy()
        b(A || new i('pipe'))
      }
    }
  }
  function l(E) {
    E()
  }
  function p(E, d) {
    return E.pipe(d)
  }
  function g(E) {
    return !E.length || typeof E[E.length - 1] != 'function' ? s : E.pop()
  }
  function v() {
    for (var E = arguments.length, d = new Array(E), x = 0; x < E; x++) d[x] = arguments[x]
    var b = g(d)
    if ((Array.isArray(d[0]) && (d = d[0]), d.length < 2)) throw new n('streams')
    var T,
      m = d.map(function (A, I) {
        var D = I < d.length - 1,
          L = I > 0
        return o(A, D, L, function (q) {
          ;(T || (T = q), q && m.forEach(l), !D && (m.forEach(l), b(T)))
        })
      })
    return d.reduce(p)
  }
  return ((Xi = v), Xi)
}
var Wc = Xe,
  zc = Bc.EventEmitter,
  _m = Lt
_m(Xe, zc)
Xe.Readable = id()
Xe.Writable = nd()
Xe.Duplex = nr()
Xe.Transform = sd()
Xe.PassThrough = ym()
Xe.finished = Hc()
Xe.pipeline = vm()
Xe.Stream = Xe
function Xe() {
  zc.call(this)
}
Xe.prototype.pipe = function (t, e) {
  var r = this
  function n(g) {
    t.writable && t.write(g) === !1 && r.pause && r.pause()
  }
  r.on('data', n)
  function i() {
    r.readable && r.resume && r.resume()
  }
  ;(t.on('drain', i), !t._isStdio && (!e || e.end !== !1) && (r.on('end', a), r.on('close', o)))
  var s = !1
  function a() {
    s || ((s = !0), t.end())
  }
  function o() {
    s || ((s = !0), typeof t.destroy == 'function' && t.destroy())
  }
  function l(g) {
    if ((p(), zc.listenerCount(this, 'error') === 0)) throw g
  }
  ;(r.on('error', l), t.on('error', l))
  function p() {
    ;(r.removeListener('data', n),
      t.removeListener('drain', i),
      r.removeListener('end', a),
      r.removeListener('close', o),
      r.removeListener('error', l),
      t.removeListener('error', l),
      r.removeListener('end', p),
      r.removeListener('close', p),
      t.removeListener('close', p))
  }
  return (r.on('end', p), r.on('close', p), t.on('close', p), t.emit('pipe', r), t)
}
;(function (t) {
  ;(function (e) {
    ;((e.parser = function (y, w) {
      return new n(y, w)
    }),
      (e.SAXParser = n),
      (e.SAXStream = g),
      (e.createStream = p),
      (e.MAX_BUFFER_LENGTH = 64 * 1024))
    var r = [
      'comment',
      'sgmlDecl',
      'textNode',
      'tagName',
      'doctype',
      'procInstName',
      'procInstBody',
      'entity',
      'attribName',
      'attribValue',
      'cdata',
      'script',
    ]
    e.EVENTS = [
      'text',
      'processinginstruction',
      'sgmldeclaration',
      'doctype',
      'comment',
      'opentagstart',
      'attribute',
      'opentag',
      'closetag',
      'opencdata',
      'cdata',
      'closecdata',
      'error',
      'end',
      'ready',
      'script',
      'opennamespace',
      'closenamespace',
    ]
    function n(y, w) {
      if (!(this instanceof n)) return new n(y, w)
      var U = this
      ;(s(U),
        (U.q = U.c = ''),
        (U.bufferCheckPosition = e.MAX_BUFFER_LENGTH),
        (U.opt = w || {}),
        (U.opt.lowercase = U.opt.lowercase || U.opt.lowercasetags),
        (U.looseCase = U.opt.lowercase ? 'toLowerCase' : 'toUpperCase'),
        (U.tags = []),
        (U.closed = U.closedRoot = U.sawRoot = !1),
        (U.tag = U.error = null),
        (U.strict = !!y),
        (U.noscript = !!(y || U.opt.noscript)),
        (U.state = R.BEGIN),
        (U.strictEntities = U.opt.strictEntities),
        (U.ENTITIES = U.strictEntities ? Object.create(e.XML_ENTITIES) : Object.create(e.ENTITIES)),
        (U.attribList = []),
        U.opt.xmlns && (U.ns = Object.create(b)),
        (U.trackPosition = U.opt.position !== !1),
        U.trackPosition && (U.position = U.line = U.column = 0),
        he(U, 'onready'))
    }
    ;(Object.create ||
      (Object.create = function (y) {
        function w() {}
        w.prototype = y
        var U = new w()
        return U
      }),
      Object.keys ||
        (Object.keys = function (y) {
          var w = []
          for (var U in y) y.hasOwnProperty(U) && w.push(U)
          return w
        }))
    function i(y) {
      for (var w = Math.max(e.MAX_BUFFER_LENGTH, 10), U = 0, B = 0, N = r.length; B < N; B++) {
        var C = y[r[B]].length
        if (C > w)
          switch (r[B]) {
            case 'textNode':
              V(y)
              break
            case 'cdata':
              ;(F(y, 'oncdata', y.cdata), (y.cdata = ''))
              break
            case 'script':
              ;(F(y, 'onscript', y.script), (y.script = ''))
              break
            default:
              Y(y, 'Max buffer length exceeded: ' + r[B])
          }
        U = Math.max(U, C)
      }
      var ee = e.MAX_BUFFER_LENGTH - U
      y.bufferCheckPosition = ee + y.position
    }
    function s(y) {
      for (var w = 0, U = r.length; w < U; w++) y[r[w]] = ''
    }
    function a(y) {
      ;(V(y),
        y.cdata !== '' && (F(y, 'oncdata', y.cdata), (y.cdata = '')),
        y.script !== '' && (F(y, 'onscript', y.script), (y.script = '')))
    }
    n.prototype = {
      end: function () {
        le(this)
      },
      write: W,
      resume: function () {
        return ((this.error = null), this)
      },
      close: function () {
        return this.write(null)
      },
      flush: function () {
        a(this)
      },
    }
    var o
    try {
      o = Wc.Stream
    } catch {
      o = function () {}
    }
    var l = e.EVENTS.filter(function (y) {
      return y !== 'error' && y !== 'end'
    })
    function p(y, w) {
      return new g(y, w)
    }
    function g(y, w) {
      if (!(this instanceof g)) return new g(y, w)
      ;(o.apply(this), (this._parser = new n(y, w)), (this.writable = !0), (this.readable = !0))
      var U = this
      ;((this._parser.onend = function () {
        U.emit('end')
      }),
        (this._parser.onerror = function (B) {
          ;(U.emit('error', B), (U._parser.error = null))
        }),
        (this._decoder = null),
        l.forEach(function (B) {
          Object.defineProperty(U, 'on' + B, {
            get: function () {
              return U._parser['on' + B]
            },
            set: function (N) {
              if (!N) return (U.removeAllListeners(B), (U._parser['on' + B] = N), N)
              U.on(B, N)
            },
            enumerable: !0,
            configurable: !1,
          })
        }))
    }
    ;((g.prototype = Object.create(o.prototype, { constructor: { value: g } })),
      (g.prototype.write = function (y) {
        if (
          typeof Buffer == 'function' &&
          typeof Buffer.isBuffer == 'function' &&
          Buffer.isBuffer(y)
        ) {
          if (!this._decoder) {
            var w = as().StringDecoder
            this._decoder = new w('utf8')
          }
          y = this._decoder.write(y)
        }
        return (this._parser.write(y.toString()), this.emit('data', y), !0)
      }),
      (g.prototype.end = function (y) {
        return (y && y.length && this.write(y), this._parser.end(), !0)
      }),
      (g.prototype.on = function (y, w) {
        var U = this
        return (
          !U._parser['on' + y] &&
            l.indexOf(y) !== -1 &&
            (U._parser['on' + y] = function () {
              var B = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
              ;(B.splice(0, 0, y), U.emit.apply(U, B))
            }),
          o.prototype.on.call(U, y, w)
        )
      }))
    var v = '[CDATA[',
      E = 'DOCTYPE',
      d = 'http://www.w3.org/XML/1998/namespace',
      x = 'http://www.w3.org/2000/xmlns/',
      b = { xml: d, xmlns: x },
      T =
        /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,
      m =
        /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/,
      A =
        /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/,
      I =
        /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/
    function D(y) {
      return (
        y === ' ' ||
        y ===
          `
` ||
        y === '\r' ||
        y === '	'
      )
    }
    function L(y) {
      return y === '"' || y === "'"
    }
    function q(y) {
      return y === '>' || D(y)
    }
    function K(y, w) {
      return y.test(w)
    }
    function J(y, w) {
      return !K(y, w)
    }
    var R = 0
    ;((e.STATE = {
      BEGIN: R++,
      BEGIN_WHITESPACE: R++,
      TEXT: R++,
      TEXT_ENTITY: R++,
      OPEN_WAKA: R++,
      SGML_DECL: R++,
      SGML_DECL_QUOTED: R++,
      DOCTYPE: R++,
      DOCTYPE_QUOTED: R++,
      DOCTYPE_DTD: R++,
      DOCTYPE_DTD_QUOTED: R++,
      COMMENT_STARTING: R++,
      COMMENT: R++,
      COMMENT_ENDING: R++,
      COMMENT_ENDED: R++,
      CDATA: R++,
      CDATA_ENDING: R++,
      CDATA_ENDING_2: R++,
      PROC_INST: R++,
      PROC_INST_BODY: R++,
      PROC_INST_ENDING: R++,
      OPEN_TAG: R++,
      OPEN_TAG_SLASH: R++,
      ATTRIB: R++,
      ATTRIB_NAME: R++,
      ATTRIB_NAME_SAW_WHITE: R++,
      ATTRIB_VALUE: R++,
      ATTRIB_VALUE_QUOTED: R++,
      ATTRIB_VALUE_CLOSED: R++,
      ATTRIB_VALUE_UNQUOTED: R++,
      ATTRIB_VALUE_ENTITY_Q: R++,
      ATTRIB_VALUE_ENTITY_U: R++,
      CLOSE_TAG: R++,
      CLOSE_TAG_SAW_WHITE: R++,
      SCRIPT: R++,
      SCRIPT_ENDING: R++,
    }),
      (e.XML_ENTITIES = { amp: '&', gt: '>', lt: '<', quot: '"', apos: "'" }),
      (e.ENTITIES = {
        amp: '&',
        gt: '>',
        lt: '<',
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830,
      }),
      Object.keys(e.ENTITIES).forEach(function (y) {
        var w = e.ENTITIES[y],
          U = typeof w == 'number' ? String.fromCharCode(w) : w
        e.ENTITIES[y] = U
      }))
    for (var oe in e.STATE) e.STATE[e.STATE[oe]] = oe
    R = e.STATE
    function he(y, w, U) {
      y[w] && y[w](U)
    }
    function F(y, w, U) {
      ;(y.textNode && V(y), he(y, w, U))
    }
    function V(y) {
      ;((y.textNode = S(y.opt, y.textNode)),
        y.textNode && he(y, 'ontext', y.textNode),
        (y.textNode = ''))
    }
    function S(y, w) {
      return (y.trim && (w = w.trim()), y.normalize && (w = w.replace(/\s+/g, ' ')), w)
    }
    function Y(y, w) {
      return (
        V(y),
        y.trackPosition &&
          (w +=
            `
Line: ` +
            y.line +
            `
Column: ` +
            y.column +
            `
Char: ` +
            y.c),
        (w = new Error(w)),
        (y.error = w),
        he(y, 'onerror', w),
        y
      )
    }
    function le(y) {
      return (
        y.sawRoot && !y.closedRoot && Z(y, 'Unclosed root tag'),
        y.state !== R.BEGIN &&
          y.state !== R.BEGIN_WHITESPACE &&
          y.state !== R.TEXT &&
          Y(y, 'Unexpected end'),
        V(y),
        (y.c = ''),
        (y.closed = !0),
        he(y, 'onend'),
        n.call(y, y.strict, y.opt),
        y
      )
    }
    function Z(y, w) {
      if (typeof y != 'object' || !(y instanceof n)) throw new Error('bad call to strictFail')
      y.strict && Y(y, w)
    }
    function pe(y) {
      y.strict || (y.tagName = y.tagName[y.looseCase]())
      var w = y.tags[y.tags.length - 1] || y,
        U = (y.tag = { name: y.tagName, attributes: {} })
      ;(y.opt.xmlns && (U.ns = w.ns), (y.attribList.length = 0), F(y, 'onopentagstart', U))
    }
    function re(y, w) {
      var U = y.indexOf(':'),
        B = U < 0 ? ['', y] : y.split(':'),
        N = B[0],
        C = B[1]
      return (w && y === 'xmlns' && ((N = 'xmlns'), (C = '')), { prefix: N, local: C })
    }
    function de(y) {
      if (
        (y.strict || (y.attribName = y.attribName[y.looseCase]()),
        y.attribList.indexOf(y.attribName) !== -1 || y.tag.attributes.hasOwnProperty(y.attribName))
      ) {
        y.attribName = y.attribValue = ''
        return
      }
      if (y.opt.xmlns) {
        var w = re(y.attribName, !0),
          U = w.prefix,
          B = w.local
        if (U === 'xmlns')
          if (B === 'xml' && y.attribValue !== d)
            Z(
              y,
              'xml: prefix must be bound to ' +
                d +
                `
Actual: ` +
                y.attribValue,
            )
          else if (B === 'xmlns' && y.attribValue !== x)
            Z(
              y,
              'xmlns: prefix must be bound to ' +
                x +
                `
Actual: ` +
                y.attribValue,
            )
          else {
            var N = y.tag,
              C = y.tags[y.tags.length - 1] || y
            ;(N.ns === C.ns && (N.ns = Object.create(C.ns)), (N.ns[B] = y.attribValue))
          }
        y.attribList.push([y.attribName, y.attribValue])
      } else
        ((y.tag.attributes[y.attribName] = y.attribValue),
          F(y, 'onattribute', { name: y.attribName, value: y.attribValue }))
      y.attribName = y.attribValue = ''
    }
    function j(y, w) {
      if (y.opt.xmlns) {
        var U = y.tag,
          B = re(y.tagName)
        ;((U.prefix = B.prefix),
          (U.local = B.local),
          (U.uri = U.ns[B.prefix] || ''),
          U.prefix &&
            !U.uri &&
            (Z(y, 'Unbound namespace prefix: ' + JSON.stringify(y.tagName)), (U.uri = B.prefix)))
        var N = y.tags[y.tags.length - 1] || y
        U.ns &&
          N.ns !== U.ns &&
          Object.keys(U.ns).forEach(function (P) {
            F(y, 'onopennamespace', { prefix: P, uri: U.ns[P] })
          })
        for (var C = 0, ee = y.attribList.length; C < ee; C++) {
          var f = y.attribList[C],
            X = f[0],
            _ = f[1],
            u = re(X, !0),
            c = u.prefix,
            h = u.local,
            O = c === '' ? '' : U.ns[c] || '',
            H = { name: X, value: _, prefix: c, local: h, uri: O }
          ;(c &&
            c !== 'xmlns' &&
            !O &&
            (Z(y, 'Unbound namespace prefix: ' + JSON.stringify(c)), (H.uri = c)),
            (y.tag.attributes[X] = H),
            F(y, 'onattribute', H))
        }
        y.attribList.length = 0
      }
      ;((y.tag.isSelfClosing = !!w),
        (y.sawRoot = !0),
        y.tags.push(y.tag),
        F(y, 'onopentag', y.tag),
        w ||
          (!y.noscript && y.tagName.toLowerCase() === 'script'
            ? (y.state = R.SCRIPT)
            : (y.state = R.TEXT),
          (y.tag = null),
          (y.tagName = '')),
        (y.attribName = y.attribValue = ''),
        (y.attribList.length = 0))
    }
    function k(y) {
      if (!y.tagName) {
        ;(Z(y, 'Weird empty close tag.'), (y.textNode += '</>'), (y.state = R.TEXT))
        return
      }
      if (y.script) {
        if (y.tagName !== 'script') {
          ;((y.script += '</' + y.tagName + '>'), (y.tagName = ''), (y.state = R.SCRIPT))
          return
        }
        ;(F(y, 'onscript', y.script), (y.script = ''))
      }
      var w = y.tags.length,
        U = y.tagName
      y.strict || (U = U[y.looseCase]())
      for (var B = U; w--; ) {
        var N = y.tags[w]
        if (N.name !== B) Z(y, 'Unexpected close tag')
        else break
      }
      if (w < 0) {
        ;(Z(y, 'Unmatched closing tag: ' + y.tagName),
          (y.textNode += '</' + y.tagName + '>'),
          (y.state = R.TEXT))
        return
      }
      y.tagName = U
      for (var C = y.tags.length; C-- > w; ) {
        var ee = (y.tag = y.tags.pop())
        ;((y.tagName = y.tag.name), F(y, 'onclosetag', y.tagName))
        var f = {}
        for (var X in ee.ns) f[X] = ee.ns[X]
        var _ = y.tags[y.tags.length - 1] || y
        y.opt.xmlns &&
          ee.ns !== _.ns &&
          Object.keys(ee.ns).forEach(function (u) {
            var c = ee.ns[u]
            F(y, 'onclosenamespace', { prefix: u, uri: c })
          })
      }
      ;(w === 0 && (y.closedRoot = !0),
        (y.tagName = y.attribValue = y.attribName = ''),
        (y.attribList.length = 0),
        (y.state = R.TEXT))
    }
    function z(y) {
      var w = y.entity,
        U = w.toLowerCase(),
        B,
        N = ''
      return y.ENTITIES[w]
        ? y.ENTITIES[w]
        : y.ENTITIES[U]
          ? y.ENTITIES[U]
          : ((w = U),
            w.charAt(0) === '#' &&
              (w.charAt(1) === 'x'
                ? ((w = w.slice(2)), (B = parseInt(w, 16)), (N = B.toString(16)))
                : ((w = w.slice(1)), (B = parseInt(w, 10)), (N = B.toString(10)))),
            (w = w.replace(/^0+/, '')),
            isNaN(B) || N.toLowerCase() !== w
              ? (Z(y, 'Invalid character entity'), '&' + y.entity + ';')
              : String.fromCodePoint(B))
    }
    function G(y, w) {
      w === '<'
        ? ((y.state = R.OPEN_WAKA), (y.startTagPosition = y.position))
        : D(w) || (Z(y, 'Non-whitespace before first tag.'), (y.textNode = w), (y.state = R.TEXT))
    }
    function te(y, w) {
      var U = ''
      return (w < y.length && (U = y.charAt(w)), U)
    }
    function W(y) {
      var w = this
      if (this.error) throw this.error
      if (w.closed) return Y(w, 'Cannot write after close. Assign an onready handler.')
      if (y === null) return le(w)
      typeof y == 'object' && (y = y.toString())
      for (var U = 0, B = ''; (B = te(y, U++)), (w.c = B), !!B; )
        switch (
          (w.trackPosition &&
            (w.position++,
            B ===
            `
`
              ? (w.line++, (w.column = 0))
              : w.column++),
          w.state)
        ) {
          case R.BEGIN:
            if (((w.state = R.BEGIN_WHITESPACE), B === '\uFEFF')) continue
            G(w, B)
            continue
          case R.BEGIN_WHITESPACE:
            G(w, B)
            continue
          case R.TEXT:
            if (w.sawRoot && !w.closedRoot) {
              for (var N = U - 1; B && B !== '<' && B !== '&'; )
                ((B = te(y, U++)),
                  B &&
                    w.trackPosition &&
                    (w.position++,
                    B ===
                    `
`
                      ? (w.line++, (w.column = 0))
                      : w.column++))
              w.textNode += y.substring(N, U - 1)
            }
            B === '<' && !(w.sawRoot && w.closedRoot && !w.strict)
              ? ((w.state = R.OPEN_WAKA), (w.startTagPosition = w.position))
              : (!D(B) && (!w.sawRoot || w.closedRoot) && Z(w, 'Text data outside of root node.'),
                B === '&' ? (w.state = R.TEXT_ENTITY) : (w.textNode += B))
            continue
          case R.SCRIPT:
            B === '<' ? (w.state = R.SCRIPT_ENDING) : (w.script += B)
            continue
          case R.SCRIPT_ENDING:
            B === '/' ? (w.state = R.CLOSE_TAG) : ((w.script += '<' + B), (w.state = R.SCRIPT))
            continue
          case R.OPEN_WAKA:
            if (B === '!') ((w.state = R.SGML_DECL), (w.sgmlDecl = ''))
            else if (!D(B))
              if (K(T, B)) ((w.state = R.OPEN_TAG), (w.tagName = B))
              else if (B === '/') ((w.state = R.CLOSE_TAG), (w.tagName = ''))
              else if (B === '?') ((w.state = R.PROC_INST), (w.procInstName = w.procInstBody = ''))
              else {
                if ((Z(w, 'Unencoded <'), w.startTagPosition + 1 < w.position)) {
                  var C = w.position - w.startTagPosition
                  B = new Array(C).join(' ') + B
                }
                ;((w.textNode += '<' + B), (w.state = R.TEXT))
              }
            continue
          case R.SGML_DECL:
            ;(w.sgmlDecl + B).toUpperCase() === v
              ? (F(w, 'onopencdata'), (w.state = R.CDATA), (w.sgmlDecl = ''), (w.cdata = ''))
              : w.sgmlDecl + B === '--'
                ? ((w.state = R.COMMENT), (w.comment = ''), (w.sgmlDecl = ''))
                : (w.sgmlDecl + B).toUpperCase() === E
                  ? ((w.state = R.DOCTYPE),
                    (w.doctype || w.sawRoot) && Z(w, 'Inappropriately located doctype declaration'),
                    (w.doctype = ''),
                    (w.sgmlDecl = ''))
                  : B === '>'
                    ? (F(w, 'onsgmldeclaration', w.sgmlDecl), (w.sgmlDecl = ''), (w.state = R.TEXT))
                    : (L(B) && (w.state = R.SGML_DECL_QUOTED), (w.sgmlDecl += B))
            continue
          case R.SGML_DECL_QUOTED:
            ;(B === w.q && ((w.state = R.SGML_DECL), (w.q = '')), (w.sgmlDecl += B))
            continue
          case R.DOCTYPE:
            B === '>'
              ? ((w.state = R.TEXT), F(w, 'ondoctype', w.doctype), (w.doctype = !0))
              : ((w.doctype += B),
                B === '['
                  ? (w.state = R.DOCTYPE_DTD)
                  : L(B) && ((w.state = R.DOCTYPE_QUOTED), (w.q = B)))
            continue
          case R.DOCTYPE_QUOTED:
            ;((w.doctype += B), B === w.q && ((w.q = ''), (w.state = R.DOCTYPE)))
            continue
          case R.DOCTYPE_DTD:
            ;((w.doctype += B),
              B === ']'
                ? (w.state = R.DOCTYPE)
                : L(B) && ((w.state = R.DOCTYPE_DTD_QUOTED), (w.q = B)))
            continue
          case R.DOCTYPE_DTD_QUOTED:
            ;((w.doctype += B), B === w.q && ((w.state = R.DOCTYPE_DTD), (w.q = '')))
            continue
          case R.COMMENT:
            B === '-' ? (w.state = R.COMMENT_ENDING) : (w.comment += B)
            continue
          case R.COMMENT_ENDING:
            B === '-'
              ? ((w.state = R.COMMENT_ENDED),
                (w.comment = S(w.opt, w.comment)),
                w.comment && F(w, 'oncomment', w.comment),
                (w.comment = ''))
              : ((w.comment += '-' + B), (w.state = R.COMMENT))
            continue
          case R.COMMENT_ENDED:
            B !== '>'
              ? (Z(w, 'Malformed comment'), (w.comment += '--' + B), (w.state = R.COMMENT))
              : (w.state = R.TEXT)
            continue
          case R.CDATA:
            B === ']' ? (w.state = R.CDATA_ENDING) : (w.cdata += B)
            continue
          case R.CDATA_ENDING:
            B === ']' ? (w.state = R.CDATA_ENDING_2) : ((w.cdata += ']' + B), (w.state = R.CDATA))
            continue
          case R.CDATA_ENDING_2:
            B === '>'
              ? (w.cdata && F(w, 'oncdata', w.cdata),
                F(w, 'onclosecdata'),
                (w.cdata = ''),
                (w.state = R.TEXT))
              : B === ']'
                ? (w.cdata += ']')
                : ((w.cdata += ']]' + B), (w.state = R.CDATA))
            continue
          case R.PROC_INST:
            B === '?'
              ? (w.state = R.PROC_INST_ENDING)
              : D(B)
                ? (w.state = R.PROC_INST_BODY)
                : (w.procInstName += B)
            continue
          case R.PROC_INST_BODY:
            if (!w.procInstBody && D(B)) continue
            B === '?' ? (w.state = R.PROC_INST_ENDING) : (w.procInstBody += B)
            continue
          case R.PROC_INST_ENDING:
            B === '>'
              ? (F(w, 'onprocessinginstruction', { name: w.procInstName, body: w.procInstBody }),
                (w.procInstName = w.procInstBody = ''),
                (w.state = R.TEXT))
              : ((w.procInstBody += '?' + B), (w.state = R.PROC_INST_BODY))
            continue
          case R.OPEN_TAG:
            K(m, B)
              ? (w.tagName += B)
              : (pe(w),
                B === '>'
                  ? j(w)
                  : B === '/'
                    ? (w.state = R.OPEN_TAG_SLASH)
                    : (D(B) || Z(w, 'Invalid character in tag name'), (w.state = R.ATTRIB)))
            continue
          case R.OPEN_TAG_SLASH:
            B === '>'
              ? (j(w, !0), k(w))
              : (Z(w, 'Forward-slash in opening tag not followed by >'), (w.state = R.ATTRIB))
            continue
          case R.ATTRIB:
            if (D(B)) continue
            B === '>'
              ? j(w)
              : B === '/'
                ? (w.state = R.OPEN_TAG_SLASH)
                : K(T, B)
                  ? ((w.attribName = B), (w.attribValue = ''), (w.state = R.ATTRIB_NAME))
                  : Z(w, 'Invalid attribute name')
            continue
          case R.ATTRIB_NAME:
            B === '='
              ? (w.state = R.ATTRIB_VALUE)
              : B === '>'
                ? (Z(w, 'Attribute without value'), (w.attribValue = w.attribName), de(w), j(w))
                : D(B)
                  ? (w.state = R.ATTRIB_NAME_SAW_WHITE)
                  : K(m, B)
                    ? (w.attribName += B)
                    : Z(w, 'Invalid attribute name')
            continue
          case R.ATTRIB_NAME_SAW_WHITE:
            if (B === '=') w.state = R.ATTRIB_VALUE
            else {
              if (D(B)) continue
              ;(Z(w, 'Attribute without value'),
                (w.tag.attributes[w.attribName] = ''),
                (w.attribValue = ''),
                F(w, 'onattribute', { name: w.attribName, value: '' }),
                (w.attribName = ''),
                B === '>'
                  ? j(w)
                  : K(T, B)
                    ? ((w.attribName = B), (w.state = R.ATTRIB_NAME))
                    : (Z(w, 'Invalid attribute name'), (w.state = R.ATTRIB)))
            }
            continue
          case R.ATTRIB_VALUE:
            if (D(B)) continue
            L(B)
              ? ((w.q = B), (w.state = R.ATTRIB_VALUE_QUOTED))
              : (Z(w, 'Unquoted attribute value'),
                (w.state = R.ATTRIB_VALUE_UNQUOTED),
                (w.attribValue = B))
            continue
          case R.ATTRIB_VALUE_QUOTED:
            if (B !== w.q) {
              B === '&' ? (w.state = R.ATTRIB_VALUE_ENTITY_Q) : (w.attribValue += B)
              continue
            }
            ;(de(w), (w.q = ''), (w.state = R.ATTRIB_VALUE_CLOSED))
            continue
          case R.ATTRIB_VALUE_CLOSED:
            D(B)
              ? (w.state = R.ATTRIB)
              : B === '>'
                ? j(w)
                : B === '/'
                  ? (w.state = R.OPEN_TAG_SLASH)
                  : K(T, B)
                    ? (Z(w, 'No whitespace between attributes'),
                      (w.attribName = B),
                      (w.attribValue = ''),
                      (w.state = R.ATTRIB_NAME))
                    : Z(w, 'Invalid attribute name')
            continue
          case R.ATTRIB_VALUE_UNQUOTED:
            if (!q(B)) {
              B === '&' ? (w.state = R.ATTRIB_VALUE_ENTITY_U) : (w.attribValue += B)
              continue
            }
            ;(de(w), B === '>' ? j(w) : (w.state = R.ATTRIB))
            continue
          case R.CLOSE_TAG:
            if (w.tagName)
              B === '>'
                ? k(w)
                : K(m, B)
                  ? (w.tagName += B)
                  : w.script
                    ? ((w.script += '</' + w.tagName), (w.tagName = ''), (w.state = R.SCRIPT))
                    : (D(B) || Z(w, 'Invalid tagname in closing tag'),
                      (w.state = R.CLOSE_TAG_SAW_WHITE))
            else {
              if (D(B)) continue
              J(T, B)
                ? w.script
                  ? ((w.script += '</' + B), (w.state = R.SCRIPT))
                  : Z(w, 'Invalid tagname in closing tag.')
                : (w.tagName = B)
            }
            continue
          case R.CLOSE_TAG_SAW_WHITE:
            if (D(B)) continue
            B === '>' ? k(w) : Z(w, 'Invalid characters in closing tag')
            continue
          case R.TEXT_ENTITY:
          case R.ATTRIB_VALUE_ENTITY_Q:
          case R.ATTRIB_VALUE_ENTITY_U:
            var ee, f
            switch (w.state) {
              case R.TEXT_ENTITY:
                ;((ee = R.TEXT), (f = 'textNode'))
                break
              case R.ATTRIB_VALUE_ENTITY_Q:
                ;((ee = R.ATTRIB_VALUE_QUOTED), (f = 'attribValue'))
                break
              case R.ATTRIB_VALUE_ENTITY_U:
                ;((ee = R.ATTRIB_VALUE_UNQUOTED), (f = 'attribValue'))
                break
            }
            B === ';'
              ? ((w[f] += z(w)), (w.entity = ''), (w.state = ee))
              : K(w.entity.length ? I : A, B)
                ? (w.entity += B)
                : (Z(w, 'Invalid character in entity name'),
                  (w[f] += '&' + w.entity + B),
                  (w.entity = ''),
                  (w.state = ee))
            continue
          default:
            throw new Error(w, 'Unknown state: ' + w.state)
        }
      return (w.position >= w.bufferCheckPosition && i(w), w)
    }
    String.fromCodePoint ||
      (function () {
        var y = String.fromCharCode,
          w = Math.floor,
          U = function () {
            var B = 16384,
              N = [],
              C,
              ee,
              f = -1,
              X = arguments.length
            if (!X) return ''
            for (var _ = ''; ++f < X; ) {
              var u = Number(arguments[f])
              if (!isFinite(u) || u < 0 || u > 1114111 || w(u) !== u)
                throw RangeError('Invalid code point: ' + u)
              ;(u <= 65535
                ? N.push(u)
                : ((u -= 65536), (C = (u >> 10) + 55296), (ee = (u % 1024) + 56320), N.push(C, ee)),
                (f + 1 === X || N.length > B) && ((_ += y.apply(null, N)), (N.length = 0)))
            }
            return _
          }
        Object.defineProperty
          ? Object.defineProperty(String, 'fromCodePoint', {
              value: U,
              configurable: !0,
              writable: !0,
            })
          : (String.fromCodePoint = U)
      })()
  })(t)
})(Lf)
var jc = {
    isArray: function (t) {
      return Array.isArray
        ? Array.isArray(t)
        : Object.prototype.toString.call(t) === '[object Array]'
    },
  },
  bm = jc.isArray,
  Gc = {
    copyOptions: function (t) {
      var e,
        r = {}
      for (e in t) t.hasOwnProperty(e) && (r[e] = t[e])
      return r
    },
    ensureFlagExists: function (t, e) {
      ;(!(t in e) || typeof e[t] != 'boolean') && (e[t] = !1)
    },
    ensureSpacesExists: function (t) {
      ;(!('spaces' in t) || (typeof t.spaces != 'number' && typeof t.spaces != 'string')) &&
        (t.spaces = 0)
    },
    ensureAlwaysArrayExists: function (t) {
      ;(!('alwaysArray' in t) || (typeof t.alwaysArray != 'boolean' && !bm(t.alwaysArray))) &&
        (t.alwaysArray = !1)
    },
    ensureKeyExists: function (t, e) {
      ;(!(t + 'Key' in e) || typeof e[t + 'Key'] != 'string') &&
        (e[t + 'Key'] = e.compact ? '_' + t : t)
    },
    checkFnExists: function (t, e) {
      return t + 'Fn' in e
    },
  },
  Em = Lf,
  ve = Gc,
  er = jc.isArray,
  Q,
  ge
function xm(t) {
  return (
    (Q = ve.copyOptions(t)),
    ve.ensureFlagExists('ignoreDeclaration', Q),
    ve.ensureFlagExists('ignoreInstruction', Q),
    ve.ensureFlagExists('ignoreAttributes', Q),
    ve.ensureFlagExists('ignoreText', Q),
    ve.ensureFlagExists('ignoreComment', Q),
    ve.ensureFlagExists('ignoreCdata', Q),
    ve.ensureFlagExists('ignoreDoctype', Q),
    ve.ensureFlagExists('compact', Q),
    ve.ensureFlagExists('alwaysChildren', Q),
    ve.ensureFlagExists('addParent', Q),
    ve.ensureFlagExists('trim', Q),
    ve.ensureFlagExists('nativeType', Q),
    ve.ensureFlagExists('nativeTypeAttributes', Q),
    ve.ensureFlagExists('sanitize', Q),
    ve.ensureFlagExists('instructionHasAttributes', Q),
    ve.ensureFlagExists('captureSpacesBetweenElements', Q),
    ve.ensureAlwaysArrayExists(Q),
    ve.ensureKeyExists('declaration', Q),
    ve.ensureKeyExists('instruction', Q),
    ve.ensureKeyExists('attributes', Q),
    ve.ensureKeyExists('text', Q),
    ve.ensureKeyExists('comment', Q),
    ve.ensureKeyExists('cdata', Q),
    ve.ensureKeyExists('doctype', Q),
    ve.ensureKeyExists('type', Q),
    ve.ensureKeyExists('name', Q),
    ve.ensureKeyExists('elements', Q),
    ve.ensureKeyExists('parent', Q),
    ve.checkFnExists('doctype', Q),
    ve.checkFnExists('instruction', Q),
    ve.checkFnExists('cdata', Q),
    ve.checkFnExists('comment', Q),
    ve.checkFnExists('text', Q),
    ve.checkFnExists('instructionName', Q),
    ve.checkFnExists('elementName', Q),
    ve.checkFnExists('attributeName', Q),
    ve.checkFnExists('attributeValue', Q),
    ve.checkFnExists('attributes', Q),
    Q
  )
}
function od(t) {
  var e = Number(t)
  if (!isNaN(e)) return e
  var r = t.toLowerCase()
  return r === 'true' ? !0 : r === 'false' ? !1 : t
}
function Wr(t, e) {
  var r
  if (Q.compact) {
    if (
      (!ge[Q[t + 'Key']] &&
        (er(Q.alwaysArray) ? Q.alwaysArray.indexOf(Q[t + 'Key']) !== -1 : Q.alwaysArray) &&
        (ge[Q[t + 'Key']] = []),
      ge[Q[t + 'Key']] && !er(ge[Q[t + 'Key']]) && (ge[Q[t + 'Key']] = [ge[Q[t + 'Key']]]),
      t + 'Fn' in Q && typeof e == 'string' && (e = Q[t + 'Fn'](e, ge)),
      t === 'instruction' && ('instructionFn' in Q || 'instructionNameFn' in Q))
    ) {
      for (r in e)
        if (e.hasOwnProperty(r))
          if ('instructionFn' in Q) e[r] = Q.instructionFn(e[r], r, ge)
          else {
            var n = e[r]
            ;(delete e[r], (e[Q.instructionNameFn(r, n, ge)] = n))
          }
    }
    er(ge[Q[t + 'Key']]) ? ge[Q[t + 'Key']].push(e) : (ge[Q[t + 'Key']] = e)
  } else {
    ge[Q.elementsKey] || (ge[Q.elementsKey] = [])
    var i = {}
    if (((i[Q.typeKey] = t), t === 'instruction')) {
      for (r in e) if (e.hasOwnProperty(r)) break
      ;((i[Q.nameKey] = 'instructionNameFn' in Q ? Q.instructionNameFn(r, e, ge) : r),
        Q.instructionHasAttributes
          ? ((i[Q.attributesKey] = e[r][Q.attributesKey]),
            'instructionFn' in Q &&
              (i[Q.attributesKey] = Q.instructionFn(i[Q.attributesKey], r, ge)))
          : ('instructionFn' in Q && (e[r] = Q.instructionFn(e[r], r, ge)),
            (i[Q.instructionKey] = e[r])))
    } else (t + 'Fn' in Q && (e = Q[t + 'Fn'](e, ge)), (i[Q[t + 'Key']] = e))
    ;(Q.addParent && (i[Q.parentKey] = ge), ge[Q.elementsKey].push(i))
  }
}
function ad(t) {
  if (
    ('attributesFn' in Q && t && (t = Q.attributesFn(t, ge)),
    (Q.trim || 'attributeValueFn' in Q || 'attributeNameFn' in Q || Q.nativeTypeAttributes) && t)
  ) {
    var e
    for (e in t)
      if (
        t.hasOwnProperty(e) &&
        (Q.trim && (t[e] = t[e].trim()),
        Q.nativeTypeAttributes && (t[e] = od(t[e])),
        'attributeValueFn' in Q && (t[e] = Q.attributeValueFn(t[e], e, ge)),
        'attributeNameFn' in Q)
      ) {
        var r = t[e]
        ;(delete t[e], (t[Q.attributeNameFn(e, t[e], ge)] = r))
      }
  }
  return t
}
function Tm(t) {
  var e = {}
  if (t.body && (t.name.toLowerCase() === 'xml' || Q.instructionHasAttributes)) {
    for (
      var r = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g, n;
      (n = r.exec(t.body)) !== null;
    )
      e[n[1]] = n[2] || n[3] || n[4]
    e = ad(e)
  }
  if (t.name.toLowerCase() === 'xml') {
    if (Q.ignoreDeclaration) return
    ;((ge[Q.declarationKey] = {}),
      Object.keys(e).length && (ge[Q.declarationKey][Q.attributesKey] = e),
      Q.addParent && (ge[Q.declarationKey][Q.parentKey] = ge))
  } else {
    if (Q.ignoreInstruction) return
    Q.trim && (t.body = t.body.trim())
    var i = {}
    ;(Q.instructionHasAttributes && Object.keys(e).length
      ? ((i[t.name] = {}), (i[t.name][Q.attributesKey] = e))
      : (i[t.name] = t.body),
      Wr('instruction', i))
  }
}
function Am(t, e) {
  var r
  if (
    (typeof t == 'object' && ((e = t.attributes), (t = t.name)),
    (e = ad(e)),
    'elementNameFn' in Q && (t = Q.elementNameFn(t, ge)),
    Q.compact)
  ) {
    if (((r = {}), !Q.ignoreAttributes && e && Object.keys(e).length)) {
      r[Q.attributesKey] = {}
      var n
      for (n in e) e.hasOwnProperty(n) && (r[Q.attributesKey][n] = e[n])
    }
    ;(!(t in ge) &&
      (er(Q.alwaysArray) ? Q.alwaysArray.indexOf(t) !== -1 : Q.alwaysArray) &&
      (ge[t] = []),
      ge[t] && !er(ge[t]) && (ge[t] = [ge[t]]),
      er(ge[t]) ? ge[t].push(r) : (ge[t] = r))
  } else
    (ge[Q.elementsKey] || (ge[Q.elementsKey] = []),
      (r = {}),
      (r[Q.typeKey] = 'element'),
      (r[Q.nameKey] = t),
      !Q.ignoreAttributes && e && Object.keys(e).length && (r[Q.attributesKey] = e),
      Q.alwaysChildren && (r[Q.elementsKey] = []),
      ge[Q.elementsKey].push(r))
  ;((r[Q.parentKey] = ge), (ge = r))
}
function Sm(t) {
  Q.ignoreText ||
    (!t.trim() && !Q.captureSpacesBetweenElements) ||
    (Q.trim && (t = t.trim()),
    Q.nativeType && (t = od(t)),
    Q.sanitize && (t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')),
    Wr('text', t))
}
function Im(t) {
  Q.ignoreComment || (Q.trim && (t = t.trim()), Wr('comment', t))
}
function Rm(t) {
  var e = ge[Q.parentKey]
  ;(Q.addParent || delete ge[Q.parentKey], (ge = e))
}
function Nm(t) {
  Q.ignoreCdata || (Q.trim && (t = t.trim()), Wr('cdata', t))
}
function km(t) {
  Q.ignoreDoctype || ((t = t.replace(/^ /, '')), Q.trim && (t = t.trim()), Wr('doctype', t))
}
function Cm(t) {
  t.note = t
}
var ud = function (t, e) {
    var r = Em.parser(!0, {}),
      n = {}
    if (
      ((ge = n),
      (Q = xm(e)),
      (r.opt = { strictEntities: !0 }),
      (r.onopentag = Am),
      (r.ontext = Sm),
      (r.oncomment = Im),
      (r.onclosetag = Rm),
      (r.onerror = Cm),
      (r.oncdata = Nm),
      (r.ondoctype = km),
      (r.onprocessinginstruction = Tm),
      r.write(t).close(),
      n[Q.elementsKey])
    ) {
      var i = n[Q.elementsKey]
      ;(delete n[Q.elementsKey], (n[Q.elementsKey] = i), delete n.text)
    }
    return n
  },
  lh = Gc,
  Om = ud
function Dm(t) {
  var e = lh.copyOptions(t)
  return (lh.ensureSpacesExists(e), e)
}
var Fm = function (t, e) {
    var r, n, i, s
    return (
      (r = Dm(e)),
      (n = Om(t, r)),
      (s = 'compact' in r && r.compact ? '_parent' : 'parent'),
      'addParent' in r && r.addParent
        ? (i = JSON.stringify(
            n,
            function (a, o) {
              return a === s ? '_' : o
            },
            r.spaces,
          ))
        : (i = JSON.stringify(n, null, r.spaces)),
      i.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
    )
  },
  be = Gc,
  Lm = jc.isArray,
  Fe,
  Le
function Bm(t) {
  var e = be.copyOptions(t)
  return (
    be.ensureFlagExists('ignoreDeclaration', e),
    be.ensureFlagExists('ignoreInstruction', e),
    be.ensureFlagExists('ignoreAttributes', e),
    be.ensureFlagExists('ignoreText', e),
    be.ensureFlagExists('ignoreComment', e),
    be.ensureFlagExists('ignoreCdata', e),
    be.ensureFlagExists('ignoreDoctype', e),
    be.ensureFlagExists('compact', e),
    be.ensureFlagExists('indentText', e),
    be.ensureFlagExists('indentCdata', e),
    be.ensureFlagExists('indentAttributes', e),
    be.ensureFlagExists('indentInstruction', e),
    be.ensureFlagExists('fullTagEmptyElement', e),
    be.ensureFlagExists('noQuotesForNativeAttributes', e),
    be.ensureSpacesExists(e),
    typeof e.spaces == 'number' && (e.spaces = Array(e.spaces + 1).join(' ')),
    be.ensureKeyExists('declaration', e),
    be.ensureKeyExists('instruction', e),
    be.ensureKeyExists('attributes', e),
    be.ensureKeyExists('text', e),
    be.ensureKeyExists('comment', e),
    be.ensureKeyExists('cdata', e),
    be.ensureKeyExists('doctype', e),
    be.ensureKeyExists('type', e),
    be.ensureKeyExists('name', e),
    be.ensureKeyExists('elements', e),
    be.checkFnExists('doctype', e),
    be.checkFnExists('instruction', e),
    be.checkFnExists('cdata', e),
    be.checkFnExists('comment', e),
    be.checkFnExists('text', e),
    be.checkFnExists('instructionName', e),
    be.checkFnExists('elementName', e),
    be.checkFnExists('attributeName', e),
    be.checkFnExists('attributeValue', e),
    be.checkFnExists('attributes', e),
    be.checkFnExists('fullTagEmptyElement', e),
    e
  )
}
function ut(t, e, r) {
  return (
    (!r && t.spaces
      ? `
`
      : '') + Array(e + 1).join(t.spaces)
  )
}
function Gn(t, e, r) {
  if (e.ignoreAttributes) return ''
  'attributesFn' in e && (t = e.attributesFn(t, Le, Fe))
  var n,
    i,
    s,
    a,
    o = []
  for (n in t)
    t.hasOwnProperty(n) &&
      t[n] !== null &&
      t[n] !== void 0 &&
      ((a = e.noQuotesForNativeAttributes && typeof t[n] != 'string' ? '' : '"'),
      (i = '' + t[n]),
      (i = i.replace(/"/g, '&quot;')),
      (s = 'attributeNameFn' in e ? e.attributeNameFn(n, i, Le, Fe) : n),
      o.push(e.spaces && e.indentAttributes ? ut(e, r + 1, !1) : ' '),
      o.push(s + '=' + a + ('attributeValueFn' in e ? e.attributeValueFn(i, n, Le, Fe) : i) + a))
  return (
    t && Object.keys(t).length && e.spaces && e.indentAttributes && o.push(ut(e, r, !1)), o.join('')
  )
}
function cd(t, e, r) {
  return (
    (Fe = t), (Le = 'xml'), e.ignoreDeclaration ? '' : '<?xml' + Gn(t[e.attributesKey], e, r) + '?>'
  )
}
function ld(t, e, r) {
  if (e.ignoreInstruction) return ''
  var n
  for (n in t) if (t.hasOwnProperty(n)) break
  var i = 'instructionNameFn' in e ? e.instructionNameFn(n, t[n], Le, Fe) : n
  if (typeof t[n] == 'object')
    return ((Fe = t), (Le = i), '<?' + i + Gn(t[n][e.attributesKey], e, r) + '?>')
  var s = t[n] ? t[n] : ''
  return (
    'instructionFn' in e && (s = e.instructionFn(s, n, Le, Fe)),
    '<?' + i + (s ? ' ' + s : '') + '?>'
  )
}
function hd(t, e) {
  return e.ignoreComment ? '' : '<!--' + ('commentFn' in e ? e.commentFn(t, Le, Fe) : t) + '-->'
}
function fd(t, e) {
  return e.ignoreCdata
    ? ''
    : '<![CDATA[' +
        ('cdataFn' in e ? e.cdataFn(t, Le, Fe) : t.replace(']]>', ']]]]><![CDATA[>')) +
        ']]>'
}
function dd(t, e) {
  return e.ignoreDoctype ? '' : '<!DOCTYPE ' + ('doctypeFn' in e ? e.doctypeFn(t, Le, Fe) : t) + '>'
}
function Kc(t, e) {
  return e.ignoreText
    ? ''
    : ((t = '' + t),
      (t = t.replace(/&amp;/g, '&')),
      (t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')),
      'textFn' in e ? e.textFn(t, Le, Fe) : t)
}
function Pm(t, e) {
  var r
  if (t.elements && t.elements.length)
    for (r = 0; r < t.elements.length; ++r)
      switch (t.elements[r][e.typeKey]) {
        case 'text':
          if (e.indentText) return !0
          break
        case 'cdata':
          if (e.indentCdata) return !0
          break
        case 'instruction':
          if (e.indentInstruction) return !0
          break
        case 'doctype':
        case 'comment':
        case 'element':
          return !0
        default:
          return !0
      }
  return !1
}
function Um(t, e, r) {
  ;((Fe = t), (Le = t.name))
  var n = [],
    i = 'elementNameFn' in e ? e.elementNameFn(t.name, t) : t.name
  ;(n.push('<' + i), t[e.attributesKey] && n.push(Gn(t[e.attributesKey], e, r)))
  var s =
    (t[e.elementsKey] && t[e.elementsKey].length) ||
    (t[e.attributesKey] && t[e.attributesKey]['xml:space'] === 'preserve')
  return (
    s ||
      ('fullTagEmptyElementFn' in e
        ? (s = e.fullTagEmptyElementFn(t.name, t))
        : (s = e.fullTagEmptyElement)),
    s
      ? (n.push('>'),
        t[e.elementsKey] &&
          t[e.elementsKey].length &&
          (n.push(pd(t[e.elementsKey], e, r + 1)), (Fe = t), (Le = t.name)),
        n.push(
          e.spaces && Pm(t, e)
            ? `
` + Array(r + 1).join(e.spaces)
            : '',
        ),
        n.push('</' + i + '>'))
      : n.push('/>'),
    n.join('')
  )
}
function pd(t, e, r, n) {
  return t.reduce(function (i, s) {
    var a = ut(e, r, n && !i)
    switch (s.type) {
      case 'element':
        return i + a + Um(s, e, r)
      case 'comment':
        return i + a + hd(s[e.commentKey], e)
      case 'doctype':
        return i + a + dd(s[e.doctypeKey], e)
      case 'cdata':
        return i + (e.indentCdata ? a : '') + fd(s[e.cdataKey], e)
      case 'text':
        return i + (e.indentText ? a : '') + Kc(s[e.textKey], e)
      case 'instruction':
        var o = {}
        return (
          (o[s[e.nameKey]] = s[e.attributesKey] ? s : s[e.instructionKey]),
          i + (e.indentInstruction ? a : '') + ld(o, e, r)
        )
    }
  }, '')
}
function md(t, e, r) {
  var n
  for (n in t)
    if (t.hasOwnProperty(n))
      switch (n) {
        case e.parentKey:
        case e.attributesKey:
          break
        case e.textKey:
          if (e.indentText || r) return !0
          break
        case e.cdataKey:
          if (e.indentCdata || r) return !0
          break
        case e.instructionKey:
          if (e.indentInstruction || r) return !0
          break
        case e.doctypeKey:
        case e.commentKey:
          return !0
        default:
          return !0
      }
  return !1
}
function Mm(t, e, r, n, i) {
  ;((Fe = t), (Le = e))
  var s = 'elementNameFn' in r ? r.elementNameFn(e, t) : e
  if (typeof t > 'u' || t === null || t === '')
    return ('fullTagEmptyElementFn' in r && r.fullTagEmptyElementFn(e, t)) || r.fullTagEmptyElement
      ? '<' + s + '></' + s + '>'
      : '<' + s + '/>'
  var a = []
  if (e) {
    if ((a.push('<' + s), typeof t != 'object'))
      return (a.push('>' + Kc(t, r) + '</' + s + '>'), a.join(''))
    t[r.attributesKey] && a.push(Gn(t[r.attributesKey], r, n))
    var o = md(t, r, !0) || (t[r.attributesKey] && t[r.attributesKey]['xml:space'] === 'preserve')
    if (
      (o ||
        ('fullTagEmptyElementFn' in r
          ? (o = r.fullTagEmptyElementFn(e, t))
          : (o = r.fullTagEmptyElement)),
      o)
    )
      a.push('>')
    else return (a.push('/>'), a.join(''))
  }
  return (
    a.push(wd(t, r, n + 1, !1)),
    (Fe = t),
    (Le = e),
    e && a.push((i ? ut(r, n, !1) : '') + '</' + s + '>'),
    a.join('')
  )
}
function wd(t, e, r, n) {
  var i,
    s,
    a,
    o = []
  for (s in t)
    if (t.hasOwnProperty(s))
      for (a = Lm(t[s]) ? t[s] : [t[s]], i = 0; i < a.length; ++i) {
        switch (s) {
          case e.declarationKey:
            o.push(cd(a[i], e, r))
            break
          case e.instructionKey:
            o.push((e.indentInstruction ? ut(e, r, n) : '') + ld(a[i], e, r))
            break
          case e.attributesKey:
          case e.parentKey:
            break
          case e.textKey:
            o.push((e.indentText ? ut(e, r, n) : '') + Kc(a[i], e))
            break
          case e.cdataKey:
            o.push((e.indentCdata ? ut(e, r, n) : '') + fd(a[i], e))
            break
          case e.doctypeKey:
            o.push(ut(e, r, n) + dd(a[i], e))
            break
          case e.commentKey:
            o.push(ut(e, r, n) + hd(a[i], e))
            break
          default:
            o.push(ut(e, r, n) + Mm(a[i], s, e, r, md(a[i], e)))
        }
        n = n && !o.length
      }
  return o.join('')
}
var gd = function (t, e) {
    e = Bm(e)
    var r = []
    return (
      (Fe = t),
      (Le = '_root_'),
      e.compact
        ? r.push(wd(t, e, 0, !0))
        : (t[e.declarationKey] && r.push(cd(t[e.declarationKey], e, 0)),
          t[e.elementsKey] &&
            t[e.elementsKey].length &&
            r.push(pd(t[e.elementsKey], e, 0, !r.length))),
      r.join('')
    )
  },
  Hm = gd,
  Wm = function (t, e) {
    t instanceof Buffer && (t = t.toString())
    var r = null
    if (typeof t == 'string')
      try {
        r = JSON.parse(t)
      } catch {
        throw new Error('The JSON structure is invalid')
      }
    else r = t
    return Hm(r, e)
  },
  zm = ud,
  jm = Fm,
  Gm = gd,
  Km = Wm,
  Kn = { xml2js: zm, xml2json: jm, js2xml: Gm, json2xml: Km },
  $c = (t) => {
    switch (t.type) {
      case void 0:
      case 'element':
        let e = new cs(t.name, t.attributes),
          r = t.elements || []
        for (let n of r) {
          let i = $c(n)
          i !== void 0 && e.push(i)
        }
        return e
      case 'text':
        return t.text
      default:
        return
    }
  },
  us = class extends ce {},
  cs = class extends M {
    static fromXmlString(e) {
      let r = Kn.xml2js(e, { compact: !1 })
      return $c(r)
    }
    constructor(e, r) {
      ;(super(e), r && this.root.push(new us(r)))
    }
    push(e) {
      this.root.push(e)
    }
  },
  ls = class extends M {
    constructor(e) {
      ;(super(''), (this._attr = e))
    }
    prepForXml(e) {
      return { _attr: this._attr }
    }
  },
  Dg = '',
  nn = class extends M {
    constructor(e, r) {
      ;(super(e), r && (this.root = r.root))
    }
  },
  De = (t) => {
    if (isNaN(t)) throw new Error(`Invalid value '${t}' specified. Must be an integer.`)
    return Math.floor(t)
  },
  $n = (t) => {
    let e = De(t)
    if (e < 0) throw new Error(`Invalid value '${t}' specified. Must be a positive integer.`)
    return e
  },
  Vn = (t, e) => {
    let r = e * 2
    if (t.length !== r || isNaN(+`0x${t}`))
      throw new Error(`Invalid hex value '${t}'. Expected ${r} digit hex value`)
    return t
  },
  Fg = (t) => Vn(t, 4),
  $m = (t) => Vn(t, 2),
  hh = (t) => Vn(t, 1),
  qn = (t) => {
    let e = t.slice(-2),
      r = t.substring(0, t.length - 2)
    return `${Number(r)}${e}`
  },
  yd = (t) => {
    let e = qn(t)
    if (parseFloat(e) < 0)
      throw new Error(`Invalid value '${e}' specified. Expected a positive number.`)
    return e
  },
  ir = (t) => {
    if (t === 'auto') return t
    let e = t.charAt(0) === '#' ? t.substring(1) : t
    return Vn(e, 3)
  },
  At = (t) => (typeof t == 'string' ? qn(t) : De(t)),
  Vm = (t) => (typeof t == 'string' ? yd(t) : $n(t)),
  Lg = (t) => (typeof t == 'string' ? qn(t) : De(t)),
  ke = (t) => (typeof t == 'string' ? yd(t) : $n(t)),
  qm = (t) => {
    let e = t.substring(0, t.length - 1)
    return `${Number(e)}%`
  },
  Xm = (t) => (typeof t == 'number' ? De(t) : t.slice(-1) === '%' ? qm(t) : qn(t)),
  Ym = $n,
  Zm = $n,
  Jm = (t) => t.toISOString(),
  ae = class extends M {
    constructor(e, r = !0) {
      ;(super(e), r !== !0 && this.root.push(new Ae({ val: r })))
    }
  },
  Rr = class extends M {
    constructor(e, r) {
      ;(super(e), this.root.push(new Ae({ val: Vm(r) })))
    }
  },
  Ce = class extends M {},
  lt = class extends M {
    constructor(e, r) {
      ;(super(e), this.root.push(new Ae({ val: r })))
    }
  },
  Er = (t, e) => new Ie({ name: t, attributes: { value: { key: 'w:val', value: e } } }),
  Fr = class extends M {
    constructor(e, r) {
      ;(super(e), this.root.push(new Ae({ val: r })))
    }
  },
  hs = class extends M {
    constructor(e, r) {
      ;(super(e), this.root.push(new Ae({ val: r })))
    }
  },
  xt = class extends M {
    constructor(e, r) {
      ;(super(e), this.root.push(r))
    }
  },
  Ie = class extends M {
    constructor({ name: e, attributes: r, children: n }) {
      ;(super(e), r && this.root.push(new Ge(r)), n && this.root.push(...n))
    }
  },
  st = {
    START: 'start',
    CENTER: 'center',
    END: 'end',
    BOTH: 'both',
    MEDIUM_KASHIDA: 'mediumKashida',
    DISTRIBUTE: 'distribute',
    NUM_TAB: 'numTab',
    HIGH_KASHIDA: 'highKashida',
    LOW_KASHIDA: 'lowKashida',
    THAI_DISTRIBUTE: 'thaiDistribute',
    LEFT: 'left',
    RIGHT: 'right',
    JUSTIFIED: 'both',
  },
  fs = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val' }))
    }
  },
  sn = class extends M {
    constructor(e) {
      ;(super('w:jc'), this.root.push(new fs({ val: e })))
    }
  },
  xe = class extends M {
    constructor(e, { color: r, size: n, space: i, style: s }) {
      ;(super(e),
        this.root.push(
          new ds({
            style: s,
            color: r === void 0 ? void 0 : ir(r),
            size: n === void 0 ? void 0 : Ym(n),
            space: i === void 0 ? void 0 : Zm(i),
          }),
        ))
    }
  },
  ds = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { style: 'w:val', color: 'w:color', size: 'w:sz', space: 'w:space' }))
    }
  },
  Vc = {
    SINGLE: 'single',
    DASH_DOT_STROKED: 'dashDotStroked',
    DASHED: 'dashed',
    DASH_SMALL_GAP: 'dashSmallGap',
    DOT_DASH: 'dotDash',
    DOT_DOT_DASH: 'dotDotDash',
    DOTTED: 'dotted',
    DOUBLE: 'double',
    DOUBLE_WAVE: 'doubleWave',
    INSET: 'inset',
    NIL: 'nil',
    NONE: 'none',
    OUTSET: 'outset',
    THICK: 'thick',
    THICK_THIN_LARGE_GAP: 'thickThinLargeGap',
    THICK_THIN_MEDIUM_GAP: 'thickThinMediumGap',
    THICK_THIN_SMALL_GAP: 'thickThinSmallGap',
    THIN_THICK_LARGE_GAP: 'thinThickLargeGap',
    THIN_THICK_MEDIUM_GAP: 'thinThickMediumGap',
    THIN_THICK_SMALL_GAP: 'thinThickSmallGap',
    THIN_THICK_THIN_LARGE_GAP: 'thinThickThinLargeGap',
    THIN_THICK_THIN_MEDIUM_GAP: 'thinThickThinMediumGap',
    THIN_THICK_THIN_SMALL_GAP: 'thinThickThinSmallGap',
    THREE_D_EMBOSS: 'threeDEmboss',
    THREE_D_ENGRAVE: 'threeDEngrave',
    TRIPLE: 'triple',
    WAVE: 'wave',
  },
  ps = class extends et {
    constructor(e) {
      ;(super('w:pBdr'),
        e.top && this.root.push(new xe('w:top', e.top)),
        e.bottom && this.root.push(new xe('w:bottom', e.bottom)),
        e.left && this.root.push(new xe('w:left', e.left)),
        e.right && this.root.push(new xe('w:right', e.right)))
    }
  },
  ms = class extends M {
    constructor() {
      super('w:pBdr')
      let e = new xe('w:bottom', { color: 'auto', space: 1, style: Vc.SINGLE, size: 6 })
      this.root.push(e)
    }
  },
  ws = class extends M {
    constructor({ start: e, end: r, left: n, right: i, hanging: s, firstLine: a }) {
      ;(super('w:ind'),
        this.root.push(
          new Ge({
            start: { key: 'w:start', value: e === void 0 ? void 0 : At(e) },
            end: { key: 'w:end', value: r === void 0 ? void 0 : At(r) },
            left: { key: 'w:left', value: n === void 0 ? void 0 : At(n) },
            right: { key: 'w:right', value: i === void 0 ? void 0 : At(i) },
            hanging: { key: 'w:hanging', value: s === void 0 ? void 0 : ke(s) },
            firstLine: { key: 'w:firstLine', value: a === void 0 ? void 0 : ke(a) },
          }),
        ))
    }
  },
  vd = class extends M {
    constructor() {
      super('w:br')
    }
  },
  qc = { BEGIN: 'begin', END: 'end', SEPARATE: 'separate' },
  Lr = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { type: 'w:fldCharType', dirty: 'w:dirty' }))
    }
  },
  Ve = class extends M {
    constructor(e) {
      ;(super('w:fldChar'), this.root.push(new Lr({ type: qc.BEGIN, dirty: e })))
    }
  },
  Qe = class extends M {
    constructor(e) {
      ;(super('w:fldChar'), this.root.push(new Lr({ type: qc.SEPARATE, dirty: e })))
    }
  },
  qe = class extends M {
    constructor(e) {
      ;(super('w:fldChar'), this.root.push(new Lr({ type: qc.END, dirty: e })))
    }
  },
  Pg = { CENTER: 'center', INSIDE: 'inside', LEFT: 'left', OUTSIDE: 'outside', RIGHT: 'right' },
  Ug = { BOTTOM: 'bottom', CENTER: 'center', INSIDE: 'inside', OUTSIDE: 'outside', TOP: 'top' },
  Mg = {
    DECIMAL: 'decimal',
    UPPER_ROMAN: 'upperRoman',
    LOWER_ROMAN: 'lowerRoman',
    UPPER_LETTER: 'upperLetter',
    LOWER_LETTER: 'lowerLetter',
    ORDINAL: 'ordinal',
    CARDINAL_TEXT: 'cardinalText',
    ORDINAL_TEXT: 'ordinalText',
    HEX: 'hex',
    CHICAGO: 'chicago',
    IDEOGRAPH_DIGITAL: 'ideographDigital',
    JAPANESE_COUNTING: 'japaneseCounting',
    AIUEO: 'aiueo',
    IROHA: 'iroha',
    DECIMAL_FULL_WIDTH: 'decimalFullWidth',
    DECIMAL_HALF_WIDTH: 'decimalHalfWidth',
    JAPANESE_LEGAL: 'japaneseLegal',
    JAPANESE_DIGITAL_TEN_THOUSAND: 'japaneseDigitalTenThousand',
    DECIMAL_ENCLOSED_CIRCLE: 'decimalEnclosedCircle',
    DECIMAL_FULL_WIDTH_2: 'decimalFullWidth2',
    AIUEO_FULL_WIDTH: 'aiueoFullWidth',
    IROHA_FULL_WIDTH: 'irohaFullWidth',
    DECIMAL_ZERO: 'decimalZero',
    BULLET: 'bullet',
    GANADA: 'ganada',
    CHOSUNG: 'chosung',
    DECIMAL_ENCLOSED_FULL_STOP: 'decimalEnclosedFullstop',
    DECIMAL_ENCLOSED_PAREN: 'decimalEnclosedParen',
    DECIMAL_ENCLOSED_CIRCLE_CHINESE: 'decimalEnclosedCircleChinese',
    IDEOGRAPH_ENCLOSED_CIRCLE: 'ideographEnclosedCircle',
    IDEOGRAPH_TRADITIONAL: 'ideographTraditional',
    IDEOGRAPH_ZODIAC: 'ideographZodiac',
    IDEOGRAPH_ZODIAC_TRADITIONAL: 'ideographZodiacTraditional',
    TAIWANESE_COUNTING: 'taiwaneseCounting',
    IDEOGRAPH_LEGAL_TRADITIONAL: 'ideographLegalTraditional',
    TAIWANESE_COUNTING_THOUSAND: 'taiwaneseCountingThousand',
    TAIWANESE_DIGITAL: 'taiwaneseDigital',
    CHINESE_COUNTING: 'chineseCounting',
    CHINESE_LEGAL_SIMPLIFIED: 'chineseLegalSimplified',
    CHINESE_COUNTING_TEN_THOUSAND: 'chineseCountingThousand',
    KOREAN_DIGITAL: 'koreanDigital',
    KOREAN_COUNTING: 'koreanCounting',
    KOREAN_LEGAL: 'koreanLegal',
    KOREAN_DIGITAL_2: 'koreanDigital2',
    VIETNAMESE_COUNTING: 'vietnameseCounting',
    RUSSIAN_LOWER: 'russianLower',
    RUSSIAN_UPPER: 'russianUpper',
    NONE: 'none',
    NUMBER_IN_DASH: 'numberInDash',
    HEBREW_1: 'hebrew1',
    HEBREW_2: 'hebrew2',
    ARABIC_ALPHA: 'arabicAlpha',
    ARABIC_ABJAD: 'arabicAbjad',
    HINDI_VOWELS: 'hindiVowels',
    HINDI_CONSONANTS: 'hindiConsonants',
    HINDI_NUMBERS: 'hindiNumbers',
    HINDI_COUNTING: 'hindiCounting',
    THAI_LETTERS: 'thaiLetters',
    THAI_NUMBERS: 'thaiNumbers',
    THAI_COUNTING: 'thaiCounting',
    BAHT_TEXT: 'bahtText',
    DOLLAR_TEXT: 'dollarText',
  },
  Ke = { DEFAULT: 'default', PRESERVE: 'preserve' },
  Me = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { space: 'xml:space' }))
    }
  },
  gs = class extends M {
    constructor() {
      ;(super('w:instrText'),
        this.root.push(new Me({ space: Ke.PRESERVE })),
        this.root.push('PAGE'))
    }
  },
  ys = class extends M {
    constructor() {
      ;(super('w:instrText'),
        this.root.push(new Me({ space: Ke.PRESERVE })),
        this.root.push('NUMPAGES'))
    }
  },
  vs = class extends M {
    constructor() {
      ;(super('w:instrText'),
        this.root.push(new Me({ space: Ke.PRESERVE })),
        this.root.push('SECTIONPAGES'))
    }
  },
  _s = class extends M {
    constructor() {
      ;(super('w:instrText'),
        this.root.push(new Me({ space: Ke.PRESERVE })),
        this.root.push('SECTION'))
    }
  },
  bs = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { fill: 'w:fill', color: 'w:color', type: 'w:val' }))
    }
  },
  sr = class extends M {
    constructor({ fill: e, color: r, type: n }) {
      ;(super('w:shd'),
        this.root.push(
          new bs({
            fill: e === void 0 ? void 0 : ir(e),
            color: r === void 0 ? void 0 : ir(r),
            type: n,
          }),
        ))
    }
  },
  Hg = {
    CLEAR: 'clear',
    DIAGONAL_CROSS: 'diagCross',
    DIAGONAL_STRIPE: 'diagStripe',
    HORIZONTAL_CROSS: 'horzCross',
    HORIZONTAL_STRIPE: 'horzStripe',
    NIL: 'nil',
    PERCENT_5: 'pct5',
    PERCENT_10: 'pct10',
    PERCENT_12: 'pct12',
    PERCENT_15: 'pct15',
    PERCENT_20: 'pct20',
    PERCENT_25: 'pct25',
    PERCENT_30: 'pct30',
    PERCENT_35: 'pct35',
    PERCENT_37: 'pct37',
    PERCENT_40: 'pct40',
    PERCENT_45: 'pct45',
    PERCENT_50: 'pct50',
    PERCENT_55: 'pct55',
    PERCENT_60: 'pct60',
    PERCENT_62: 'pct62',
    PERCENT_65: 'pct65',
    PERCENT_70: 'pct70',
    PERCENT_75: 'pct75',
    PERCENT_80: 'pct80',
    PERCENT_85: 'pct85',
    PERCENT_87: 'pct87',
    PERCENT_90: 'pct90',
    PERCENT_95: 'pct95',
    REVERSE_DIAGONAL_STRIPE: 'reverseDiagStripe',
    SOLID: 'solid',
    THIN_DIAGONAL_CROSS: 'thinDiagCross',
    THIN_DIAGONAL_STRIPE: 'thinDiagStripe',
    THIN_HORIZONTAL_CROSS: 'thinHorzCross',
    THIN_REVERSE_DIAGONAL_STRIPE: 'thinReverseDiagStripe',
    THIN_VERTICAL_STRIPE: 'thinVertStripe',
    VERTICAL_STRIPE: 'vertStripe',
  },
  Br = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { id: 'w:id', author: 'w:author', date: 'w:date' }))
    }
  },
  _d = { DOT: 'dot' },
  on = class extends M {
    constructor(e) {
      ;(super('w:em'), this.root.push(new Ae({ val: e })))
    }
  },
  Es = class extends on {
    constructor(e = _d.DOT) {
      super(e)
    }
  },
  fh = class extends on {
    constructor() {
      super(_d.DOT)
    }
  },
  xs = class extends M {
    constructor(e) {
      ;(super('w:spacing'), this.root.push(new Ae({ val: At(e) })))
    }
  },
  Ts = class extends M {
    constructor(e) {
      ;(super('w:color'), this.root.push(new Ae({ val: ir(e) })))
    }
  },
  As = class extends M {
    constructor(e) {
      ;(super('w:highlight'), this.root.push(new Ae({ val: e })))
    }
  },
  Ss = class extends M {
    constructor(e) {
      ;(super('w:highlightCs'), this.root.push(new Ae({ val: e })))
    }
  },
  Qm = (t) =>
    new Ie({
      name: 'w:lang',
      attributes: {
        value: { key: 'w:val', value: t.value },
        eastAsia: { key: 'w:eastAsia', value: t.eastAsia },
        bidirectional: { key: 'w:bidi', value: t.bidirectional },
      },
    }),
  an = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          ascii: 'w:ascii',
          cs: 'w:cs',
          eastAsia: 'w:eastAsia',
          hAnsi: 'w:hAnsi',
          hint: 'w:hint',
        }))
    }
  },
  Nr = class extends M {
    constructor(e, r) {
      if ((super('w:rFonts'), typeof e == 'string')) {
        let n = e
        this.root.push(new an({ ascii: n, cs: n, eastAsia: n, hAnsi: n, hint: r }))
      } else {
        let n = e
        this.root.push(new an(n))
      }
    }
  },
  bd = class extends M {
    constructor(e) {
      ;(super('w:vertAlign'), this.root.push(new Ae({ val: e })))
    }
  },
  Is = class extends bd {
    constructor() {
      super('superscript')
    }
  },
  Rs = class extends bd {
    constructor() {
      super('subscript')
    }
  },
  Ed = {
    SINGLE: 'single',
    WORDS: 'words',
    DOUBLE: 'double',
    THICK: 'thick',
    DOTTED: 'dotted',
    DOTTEDHEAVY: 'dottedHeavy',
    DASH: 'dash',
    DASHEDHEAVY: 'dashedHeavy',
    DASHLONG: 'dashLong',
    DASHLONGHEAVY: 'dashLongHeavy',
    DOTDASH: 'dotDash',
    DASHDOTHEAVY: 'dashDotHeavy',
    DOTDOTDASH: 'dotDotDash',
    DASHDOTDOTHEAVY: 'dashDotDotHeavy',
    WAVE: 'wave',
    WAVYHEAVY: 'wavyHeavy',
    WAVYDOUBLE: 'wavyDouble',
    NONE: 'none',
  },
  Ns = class extends M {
    constructor(e = Ed.SINGLE, r) {
      ;(super('w:u'), this.root.push(new Ae({ val: e, color: r === void 0 ? void 0 : ir(r) })))
    }
  },
  zg = {
    BLINK_BACKGROUND: 'blinkBackground',
    LIGHTS: 'lights',
    ANTS_BLACK: 'antsBlack',
    ANTS_RED: 'antsRed',
    SHIMMER: 'shimmer',
    SPARKLE: 'sparkle',
    NONE: 'none',
  },
  jg = {
    BLACK: 'black',
    BLUE: 'blue',
    CYAN: 'cyan',
    DARK_BLUE: 'darkBlue',
    DARK_CYAN: 'darkCyan',
    DARK_GRAY: 'darkGray',
    DARK_GREEN: 'darkGreen',
    DARK_MAGENTA: 'darkMagenta',
    DARK_RED: 'darkRed',
    DARK_YELLOW: 'darkYellow',
    GREEN: 'green',
    LIGHT_GRAY: 'lightGray',
    MAGENTA: 'magenta',
    NONE: 'none',
    RED: 'red',
    WHITE: 'white',
    YELLOW: 'yellow',
  },
  pt = class extends et {
    constructor(e) {
      var r, n
      if ((super('w:rPr'), !e)) return
      ;(e.noProof !== void 0 && this.push(new ae('w:noProof', e.noProof)),
        e.bold !== void 0 && this.push(new ae('w:b', e.bold)),
        ((e.boldComplexScript === void 0 && e.bold !== void 0) || e.boldComplexScript) &&
          this.push(new ae('w:bCs', (r = e.boldComplexScript) != null ? r : e.bold)),
        e.italics !== void 0 && this.push(new ae('w:i', e.italics)),
        ((e.italicsComplexScript === void 0 && e.italics !== void 0) || e.italicsComplexScript) &&
          this.push(new ae('w:iCs', (n = e.italicsComplexScript) != null ? n : e.italics)),
        e.underline && this.push(new Ns(e.underline.type, e.underline.color)),
        e.effect && this.push(new lt('w:effect', e.effect)),
        e.emphasisMark && this.push(new Es(e.emphasisMark.type)),
        e.color && this.push(new Ts(e.color)),
        e.kern && this.push(new Rr('w:kern', e.kern)),
        e.position && this.push(new lt('w:position', e.position)),
        e.size !== void 0 && this.push(new Rr('w:sz', e.size)))
      let i =
        e.sizeComplexScript === void 0 || e.sizeComplexScript === !0 ? e.size : e.sizeComplexScript
      ;(i && this.push(new Rr('w:szCs', i)),
        e.rightToLeft !== void 0 && this.push(new ae('w:rtl', e.rightToLeft)),
        e.smallCaps !== void 0
          ? this.push(new ae('w:smallCaps', e.smallCaps))
          : e.allCaps !== void 0 && this.push(new ae('w:caps', e.allCaps)),
        e.strike !== void 0 && this.push(new ae('w:strike', e.strike)),
        e.doubleStrike !== void 0 && this.push(new ae('w:dstrike', e.doubleStrike)),
        e.subScript && this.push(new Rs()),
        e.superScript && this.push(new Is()),
        e.style && this.push(new lt('w:rStyle', e.style)),
        e.font &&
          (typeof e.font == 'string'
            ? this.push(new Nr(e.font))
            : 'name' in e.font
              ? this.push(new Nr(e.font.name, e.font.hint))
              : this.push(new Nr(e.font))),
        e.highlight && this.push(new As(e.highlight)))
      let s =
        e.highlightComplexScript === void 0 || e.highlightComplexScript === !0
          ? e.highlight
          : e.highlightComplexScript
      ;(s && this.push(new Ss(s)),
        e.characterSpacing && this.push(new xs(e.characterSpacing)),
        e.emboss !== void 0 && this.push(new ae('w:emboss', e.emboss)),
        e.imprint !== void 0 && this.push(new ae('w:imprint', e.imprint)),
        e.shading && this.push(new sr(e.shading)),
        e.revision && this.push(new ks(e.revision)),
        e.border && this.push(new xe('w:bdr', e.border)),
        e.snapToGrid !== void 0 && this.push(new ae('w:snapToGrid', e.snapToGrid)),
        e.vanish && this.push(new ae('w:vanish', e.vanish)),
        e.specVanish && this.push(new ae('w:specVanish', e.vanish)),
        e.scale !== void 0 && this.push(new Fr('w:w', e.scale)),
        e.language && this.push(Qm(e.language)),
        e.math && this.push(new ae('w:oMath', e.math)))
    }
    push(e) {
      this.root.push(e)
    }
  },
  ks = class extends M {
    constructor(e) {
      ;(super('w:rPrChange'),
        this.root.push(new Br({ id: e.id, author: e.author, date: e.date })),
        this.addChildElement(new pt(e)))
    }
  },
  or = class extends M {
    constructor(e) {
      var r
      ;(super('w:t'),
        typeof e == 'string'
          ? (this.root.push(new Me({ space: Ke.PRESERVE })), this.root.push(e))
          : (this.root.push(new Me({ space: (r = e.space) != null ? r : Ke.DEFAULT })),
            this.root.push(e.text)))
    }
  },
  Ht = {
    CURRENT: 'CURRENT',
    TOTAL_PAGES: 'TOTAL_PAGES',
    TOTAL_PAGES_IN_SECTION: 'TOTAL_PAGES_IN_SECTION',
    CURRENT_SECTION: 'SECTION',
  },
  He = class extends M {
    constructor(e) {
      if (
        (super('w:r'),
        $(this, 'properties'),
        (this.properties = new pt(e)),
        this.root.push(this.properties),
        e.break)
      )
        for (let r = 0; r < e.break; r++) this.root.push(new vd())
      if (e.children)
        for (let r of e.children) {
          if (typeof r == 'string') {
            switch (r) {
              case Ht.CURRENT:
                ;(this.root.push(new Ve()),
                  this.root.push(new gs()),
                  this.root.push(new Qe()),
                  this.root.push(new qe()))
                break
              case Ht.TOTAL_PAGES:
                ;(this.root.push(new Ve()),
                  this.root.push(new ys()),
                  this.root.push(new Qe()),
                  this.root.push(new qe()))
                break
              case Ht.TOTAL_PAGES_IN_SECTION:
                ;(this.root.push(new Ve()),
                  this.root.push(new vs()),
                  this.root.push(new Qe()),
                  this.root.push(new qe()))
                break
              case Ht.CURRENT_SECTION:
                ;(this.root.push(new Ve()),
                  this.root.push(new _s()),
                  this.root.push(new Qe()),
                  this.root.push(new qe()))
                break
              default:
                this.root.push(new or(r))
                break
            }
            continue
          }
          this.root.push(r)
        }
      else e.text && this.root.push(new or(e.text))
    }
  },
  ar = class extends He {
    constructor(e) {
      if (typeof e == 'string') return (super({}), this.root.push(new or(e)), this)
      super(e)
    }
  },
  Cs = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { char: 'w:char', symbolfont: 'w:font' }))
    }
  },
  dh = class extends M {
    constructor(e = '', r = 'Wingdings') {
      ;(super('w:sym'), this.root.push(new Cs({ char: e, symbolfont: r })))
    }
  },
  Os = class extends He {
    constructor(e) {
      if (typeof e == 'string') return (super({}), this.root.push(new dh(e)), this)
      ;(super(e), this.root.push(new dh(e.char, e.symbolfont)))
    }
  },
  ew = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict',
  tw =
    (t, e = 21) =>
    (r = e) => {
      let n = '',
        i = r
      for (; i--; ) n += t[(Math.random() * t.length) | 0]
      return n
    },
  rw = (t = 21) => {
    let e = '',
      r = t
    for (; r--; ) e += ew[(Math.random() * 64) | 0]
    return e
  },
  xd = {},
  Ee = {},
  zr = Td
function Td(t, e) {
  if (!t) throw new Error(e || 'Assertion failed')
}
Td.equal = function (e, r, n) {
  if (e != r) throw new Error(n || 'Assertion failed: ' + e + ' != ' + r)
}
var nw = zr,
  iw = Lt
Ee.inherits = iw
function sw(t, e) {
  return (t.charCodeAt(e) & 64512) !== 55296 || e < 0 || e + 1 >= t.length
    ? !1
    : (t.charCodeAt(e + 1) & 64512) === 56320
}
function ow(t, e) {
  if (Array.isArray(t)) return t.slice()
  if (!t) return []
  var r = []
  if (typeof t == 'string')
    if (e) {
      if (e === 'hex')
        for (
          t = t.replace(/[^a-z0-9]+/gi, ''), t.length % 2 !== 0 && (t = '0' + t), i = 0;
          i < t.length;
          i += 2
        )
          r.push(parseInt(t[i] + t[i + 1], 16))
    } else
      for (var n = 0, i = 0; i < t.length; i++) {
        var s = t.charCodeAt(i)
        s < 128
          ? (r[n++] = s)
          : s < 2048
            ? ((r[n++] = (s >> 6) | 192), (r[n++] = (s & 63) | 128))
            : sw(t, i)
              ? ((s = 65536 + ((s & 1023) << 10) + (t.charCodeAt(++i) & 1023)),
                (r[n++] = (s >> 18) | 240),
                (r[n++] = ((s >> 12) & 63) | 128),
                (r[n++] = ((s >> 6) & 63) | 128),
                (r[n++] = (s & 63) | 128))
              : ((r[n++] = (s >> 12) | 224),
                (r[n++] = ((s >> 6) & 63) | 128),
                (r[n++] = (s & 63) | 128))
      }
  else for (i = 0; i < t.length; i++) r[i] = t[i] | 0
  return r
}
Ee.toArray = ow
function aw(t) {
  for (var e = '', r = 0; r < t.length; r++) e += Sd(t[r].toString(16))
  return e
}
Ee.toHex = aw
function Ad(t) {
  var e = (t >>> 24) | ((t >>> 8) & 65280) | ((t << 8) & 16711680) | ((t & 255) << 24)
  return e >>> 0
}
Ee.htonl = Ad
function uw(t, e) {
  for (var r = '', n = 0; n < t.length; n++) {
    var i = t[n]
    ;(e === 'little' && (i = Ad(i)), (r += Id(i.toString(16))))
  }
  return r
}
Ee.toHex32 = uw
function Sd(t) {
  return t.length === 1 ? '0' + t : t
}
Ee.zero2 = Sd
function Id(t) {
  return t.length === 7
    ? '0' + t
    : t.length === 6
      ? '00' + t
      : t.length === 5
        ? '000' + t
        : t.length === 4
          ? '0000' + t
          : t.length === 3
            ? '00000' + t
            : t.length === 2
              ? '000000' + t
              : t.length === 1
                ? '0000000' + t
                : t
}
Ee.zero8 = Id
function cw(t, e, r, n) {
  var i = r - e
  nw(i % 4 === 0)
  for (var s = new Array(i / 4), a = 0, o = e; a < s.length; a++, o += 4) {
    var l
    ;(n === 'big'
      ? (l = (t[o] << 24) | (t[o + 1] << 16) | (t[o + 2] << 8) | t[o + 3])
      : (l = (t[o + 3] << 24) | (t[o + 2] << 16) | (t[o + 1] << 8) | t[o]),
      (s[a] = l >>> 0))
  }
  return s
}
Ee.join32 = cw
function lw(t, e) {
  for (var r = new Array(t.length * 4), n = 0, i = 0; n < t.length; n++, i += 4) {
    var s = t[n]
    e === 'big'
      ? ((r[i] = s >>> 24),
        (r[i + 1] = (s >>> 16) & 255),
        (r[i + 2] = (s >>> 8) & 255),
        (r[i + 3] = s & 255))
      : ((r[i + 3] = s >>> 24),
        (r[i + 2] = (s >>> 16) & 255),
        (r[i + 1] = (s >>> 8) & 255),
        (r[i] = s & 255))
  }
  return r
}
Ee.split32 = lw
function hw(t, e) {
  return (t >>> e) | (t << (32 - e))
}
Ee.rotr32 = hw
function fw(t, e) {
  return (t << e) | (t >>> (32 - e))
}
Ee.rotl32 = fw
function dw(t, e) {
  return (t + e) >>> 0
}
Ee.sum32 = dw
function pw(t, e, r) {
  return (t + e + r) >>> 0
}
Ee.sum32_3 = pw
function mw(t, e, r, n) {
  return (t + e + r + n) >>> 0
}
Ee.sum32_4 = mw
function ww(t, e, r, n, i) {
  return (t + e + r + n + i) >>> 0
}
Ee.sum32_5 = ww
function gw(t, e, r, n) {
  var i = t[e],
    s = t[e + 1],
    a = (n + s) >>> 0,
    o = (a < n ? 1 : 0) + r + i
  ;((t[e] = o >>> 0), (t[e + 1] = a))
}
Ee.sum64 = gw
function yw(t, e, r, n) {
  var i = (e + n) >>> 0,
    s = (i < e ? 1 : 0) + t + r
  return s >>> 0
}
Ee.sum64_hi = yw
function vw(t, e, r, n) {
  var i = e + n
  return i >>> 0
}
Ee.sum64_lo = vw
function _w(t, e, r, n, i, s, a, o) {
  var l = 0,
    p = e
  ;((p = (p + n) >>> 0),
    (l += p < e ? 1 : 0),
    (p = (p + s) >>> 0),
    (l += p < s ? 1 : 0),
    (p = (p + o) >>> 0),
    (l += p < o ? 1 : 0))
  var g = t + r + i + a + l
  return g >>> 0
}
Ee.sum64_4_hi = _w
function bw(t, e, r, n, i, s, a, o) {
  var l = e + n + s + o
  return l >>> 0
}
Ee.sum64_4_lo = bw
function Ew(t, e, r, n, i, s, a, o, l, p) {
  var g = 0,
    v = e
  ;((v = (v + n) >>> 0),
    (g += v < e ? 1 : 0),
    (v = (v + s) >>> 0),
    (g += v < s ? 1 : 0),
    (v = (v + o) >>> 0),
    (g += v < o ? 1 : 0),
    (v = (v + p) >>> 0),
    (g += v < p ? 1 : 0))
  var E = t + r + i + a + l + g
  return E >>> 0
}
Ee.sum64_5_hi = Ew
function xw(t, e, r, n, i, s, a, o, l, p) {
  var g = e + n + s + o + p
  return g >>> 0
}
Ee.sum64_5_lo = xw
function Tw(t, e, r) {
  var n = (e << (32 - r)) | (t >>> r)
  return n >>> 0
}
Ee.rotr64_hi = Tw
function Aw(t, e, r) {
  var n = (t << (32 - r)) | (e >>> r)
  return n >>> 0
}
Ee.rotr64_lo = Aw
function Sw(t, e, r) {
  return t >>> r
}
Ee.shr64_hi = Sw
function Iw(t, e, r) {
  var n = (t << (32 - r)) | (e >>> r)
  return n >>> 0
}
Ee.shr64_lo = Iw
var wr = {},
  ph = Ee,
  Rw = zr
function Xn() {
  ;((this.pending = null),
    (this.pendingTotal = 0),
    (this.blockSize = this.constructor.blockSize),
    (this.outSize = this.constructor.outSize),
    (this.hmacStrength = this.constructor.hmacStrength),
    (this.padLength = this.constructor.padLength / 8),
    (this.endian = 'big'),
    (this._delta8 = this.blockSize / 8),
    (this._delta32 = this.blockSize / 32))
}
wr.BlockHash = Xn
Xn.prototype.update = function (e, r) {
  if (
    ((e = ph.toArray(e, r)),
    this.pending ? (this.pending = this.pending.concat(e)) : (this.pending = e),
    (this.pendingTotal += e.length),
    this.pending.length >= this._delta8)
  ) {
    e = this.pending
    var n = e.length % this._delta8
    ;((this.pending = e.slice(e.length - n, e.length)),
      this.pending.length === 0 && (this.pending = null),
      (e = ph.join32(e, 0, e.length - n, this.endian)))
    for (var i = 0; i < e.length; i += this._delta32) this._update(e, i, i + this._delta32)
  }
  return this
}
Xn.prototype.digest = function (e) {
  return (this.update(this._pad()), Rw(this.pending === null), this._digest(e))
}
Xn.prototype._pad = function () {
  var e = this.pendingTotal,
    r = this._delta8,
    n = r - ((e + this.padLength) % r),
    i = new Array(n + this.padLength)
  i[0] = 128
  for (var s = 1; s < n; s++) i[s] = 0
  if (((e <<= 3), this.endian === 'big')) {
    for (var a = 8; a < this.padLength; a++) i[s++] = 0
    ;((i[s++] = 0),
      (i[s++] = 0),
      (i[s++] = 0),
      (i[s++] = 0),
      (i[s++] = (e >>> 24) & 255),
      (i[s++] = (e >>> 16) & 255),
      (i[s++] = (e >>> 8) & 255),
      (i[s++] = e & 255))
  } else
    for (
      i[s++] = e & 255,
        i[s++] = (e >>> 8) & 255,
        i[s++] = (e >>> 16) & 255,
        i[s++] = (e >>> 24) & 255,
        i[s++] = 0,
        i[s++] = 0,
        i[s++] = 0,
        i[s++] = 0,
        a = 8;
      a < this.padLength;
      a++
    )
      i[s++] = 0
  return i
}
var gr = {},
  vt = {},
  Nw = Ee,
  ht = Nw.rotr32
function kw(t, e, r, n) {
  if (t === 0) return Rd(e, r, n)
  if (t === 1 || t === 3) return kd(e, r, n)
  if (t === 2) return Nd(e, r, n)
}
vt.ft_1 = kw
function Rd(t, e, r) {
  return (t & e) ^ (~t & r)
}
vt.ch32 = Rd
function Nd(t, e, r) {
  return (t & e) ^ (t & r) ^ (e & r)
}
vt.maj32 = Nd
function kd(t, e, r) {
  return t ^ e ^ r
}
vt.p32 = kd
function Cw(t) {
  return ht(t, 2) ^ ht(t, 13) ^ ht(t, 22)
}
vt.s0_256 = Cw
function Ow(t) {
  return ht(t, 6) ^ ht(t, 11) ^ ht(t, 25)
}
vt.s1_256 = Ow
function Dw(t) {
  return ht(t, 7) ^ ht(t, 18) ^ (t >>> 3)
}
vt.g0_256 = Dw
function Fw(t) {
  return ht(t, 17) ^ ht(t, 19) ^ (t >>> 10)
}
vt.g1_256 = Fw
var ur = Ee,
  Lw = wr,
  Bw = vt,
  Yi = ur.rotl32,
  xr = ur.sum32,
  Pw = ur.sum32_5,
  Uw = Bw.ft_1,
  Cd = Lw.BlockHash,
  Mw = [1518500249, 1859775393, 2400959708, 3395469782]
function mt() {
  if (!(this instanceof mt)) return new mt()
  ;(Cd.call(this),
    (this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520]),
    (this.W = new Array(80)))
}
ur.inherits(mt, Cd)
var Hw = mt
mt.blockSize = 512
mt.outSize = 160
mt.hmacStrength = 80
mt.padLength = 64
mt.prototype._update = function (e, r) {
  for (var n = this.W, i = 0; i < 16; i++) n[i] = e[r + i]
  for (; i < n.length; i++) n[i] = Yi(n[i - 3] ^ n[i - 8] ^ n[i - 14] ^ n[i - 16], 1)
  var s = this.h[0],
    a = this.h[1],
    o = this.h[2],
    l = this.h[3],
    p = this.h[4]
  for (i = 0; i < n.length; i++) {
    var g = ~~(i / 20),
      v = Pw(Yi(s, 5), Uw(g, a, o, l), p, n[i], Mw[g])
    ;((p = l), (l = o), (o = Yi(a, 30)), (a = s), (s = v))
  }
  ;((this.h[0] = xr(this.h[0], s)),
    (this.h[1] = xr(this.h[1], a)),
    (this.h[2] = xr(this.h[2], o)),
    (this.h[3] = xr(this.h[3], l)),
    (this.h[4] = xr(this.h[4], p)))
}
mt.prototype._digest = function (e) {
  return e === 'hex' ? ur.toHex32(this.h, 'big') : ur.split32(this.h, 'big')
}
var cr = Ee,
  Ww = wr,
  yr = vt,
  zw = zr,
  Ye = cr.sum32,
  jw = cr.sum32_4,
  Gw = cr.sum32_5,
  Kw = yr.ch32,
  $w = yr.maj32,
  Vw = yr.s0_256,
  qw = yr.s1_256,
  Xw = yr.g0_256,
  Yw = yr.g1_256,
  Od = Ww.BlockHash,
  Zw = [
    1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221,
    3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580,
    3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
    2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895,
    666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037,
    2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344,
    430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779,
    1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298,
  ]
function wt() {
  if (!(this instanceof wt)) return new wt()
  ;(Od.call(this),
    (this.h = [
      1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225,
    ]),
    (this.k = Zw),
    (this.W = new Array(64)))
}
cr.inherits(wt, Od)
var Dd = wt
wt.blockSize = 512
wt.outSize = 256
wt.hmacStrength = 192
wt.padLength = 64
wt.prototype._update = function (e, r) {
  for (var n = this.W, i = 0; i < 16; i++) n[i] = e[r + i]
  for (; i < n.length; i++) n[i] = jw(Yw(n[i - 2]), n[i - 7], Xw(n[i - 15]), n[i - 16])
  var s = this.h[0],
    a = this.h[1],
    o = this.h[2],
    l = this.h[3],
    p = this.h[4],
    g = this.h[5],
    v = this.h[6],
    E = this.h[7]
  for (zw(this.k.length === n.length), i = 0; i < n.length; i++) {
    var d = Gw(E, qw(p), Kw(p, g, v), this.k[i], n[i]),
      x = Ye(Vw(s), $w(s, a, o))
    ;((E = v), (v = g), (g = p), (p = Ye(l, d)), (l = o), (o = a), (a = s), (s = Ye(d, x)))
  }
  ;((this.h[0] = Ye(this.h[0], s)),
    (this.h[1] = Ye(this.h[1], a)),
    (this.h[2] = Ye(this.h[2], o)),
    (this.h[3] = Ye(this.h[3], l)),
    (this.h[4] = Ye(this.h[4], p)),
    (this.h[5] = Ye(this.h[5], g)),
    (this.h[6] = Ye(this.h[6], v)),
    (this.h[7] = Ye(this.h[7], E)))
}
wt.prototype._digest = function (e) {
  return e === 'hex' ? cr.toHex32(this.h, 'big') : cr.split32(this.h, 'big')
}
var Ds = Ee,
  Fd = Dd
function It() {
  if (!(this instanceof It)) return new It()
  ;(Fd.call(this),
    (this.h = [
      3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428,
    ]))
}
Ds.inherits(It, Fd)
var Jw = It
It.blockSize = 512
It.outSize = 224
It.hmacStrength = 192
It.padLength = 64
It.prototype._digest = function (e) {
  return e === 'hex' ? Ds.toHex32(this.h.slice(0, 7), 'big') : Ds.split32(this.h.slice(0, 7), 'big')
}
var je = Ee,
  Qw = wr,
  e0 = zr,
  ft = je.rotr64_hi,
  dt = je.rotr64_lo,
  Ld = je.shr64_hi,
  Bd = je.shr64_lo,
  Ot = je.sum64,
  Zi = je.sum64_hi,
  Ji = je.sum64_lo,
  t0 = je.sum64_4_hi,
  r0 = je.sum64_4_lo,
  n0 = je.sum64_5_hi,
  i0 = je.sum64_5_lo,
  Pd = Qw.BlockHash,
  s0 = [
    1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399, 3921009573, 2173295548,
    961987163, 4081628472, 1508970993, 3053834265, 2453635748, 2937671579, 2870763221, 3664609560,
    3624381080, 2734883394, 310598401, 1164996542, 607225278, 1323610764, 1426881987, 3590304994,
    1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317, 3248222580, 3479774868,
    3835390401, 2666613458, 4022224774, 944711139, 264347078, 2341262773, 604807628, 2007800933,
    770255983, 1495990901, 1249150122, 1856431235, 1555081692, 3175218132, 1996064986, 2198950837,
    2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879, 3210313671, 3203337956,
    3336571891, 1034457026, 3584528711, 2466948901, 113926993, 3758326383, 338241895, 168717936,
    666307205, 1188179964, 773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823,
    1695183700, 2343527390, 1986661051, 1014477480, 2177026350, 1206759142, 2456956037, 344077627,
    2730485921, 1290863460, 2820302411, 3158454273, 3259730800, 3505952657, 3345764771, 106217008,
    3516065817, 3606008344, 3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720,
    430227734, 3100823752, 506948616, 1363258195, 659060556, 3750685593, 883997877, 3785050280,
    958139571, 3318307427, 1322822218, 3812723403, 1537002063, 2003034995, 1747873779, 3602036899,
    1955562222, 1575990012, 2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044,
    2428436474, 593698344, 2756734187, 3733110249, 3204031479, 2999351573, 3329325298, 3815920427,
    3391569614, 3928383900, 3515267271, 566280711, 3940187606, 3454069534, 4118630271, 4000239992,
    116418474, 1914138554, 174292421, 2731055270, 289380356, 3203993006, 460393269, 320620315,
    685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100, 1126000580, 2618297676,
    1288033470, 3409855158, 1501505948, 4234509866, 1607167915, 987167468, 1816402316, 1246189591,
  ]
function tt() {
  if (!(this instanceof tt)) return new tt()
  ;(Pd.call(this),
    (this.h = [
      1779033703, 4089235720, 3144134277, 2227873595, 1013904242, 4271175723, 2773480762,
      1595750129, 1359893119, 2917565137, 2600822924, 725511199, 528734635, 4215389547, 1541459225,
      327033209,
    ]),
    (this.k = s0),
    (this.W = new Array(160)))
}
je.inherits(tt, Pd)
var Ud = tt
tt.blockSize = 1024
tt.outSize = 512
tt.hmacStrength = 192
tt.padLength = 128
tt.prototype._prepareBlock = function (e, r) {
  for (var n = this.W, i = 0; i < 32; i++) n[i] = e[r + i]
  for (; i < n.length; i += 2) {
    var s = w0(n[i - 4], n[i - 3]),
      a = g0(n[i - 4], n[i - 3]),
      o = n[i - 14],
      l = n[i - 13],
      p = p0(n[i - 30], n[i - 29]),
      g = m0(n[i - 30], n[i - 29]),
      v = n[i - 32],
      E = n[i - 31]
    ;((n[i] = t0(s, a, o, l, p, g, v, E)), (n[i + 1] = r0(s, a, o, l, p, g, v, E)))
  }
}
tt.prototype._update = function (e, r) {
  this._prepareBlock(e, r)
  var n = this.W,
    i = this.h[0],
    s = this.h[1],
    a = this.h[2],
    o = this.h[3],
    l = this.h[4],
    p = this.h[5],
    g = this.h[6],
    v = this.h[7],
    E = this.h[8],
    d = this.h[9],
    x = this.h[10],
    b = this.h[11],
    T = this.h[12],
    m = this.h[13],
    A = this.h[14],
    I = this.h[15]
  e0(this.k.length === n.length)
  for (var D = 0; D < n.length; D += 2) {
    var L = A,
      q = I,
      K = f0(E, d),
      J = d0(E, d),
      R = o0(E, d, x, b, T),
      oe = a0(E, d, x, b, T, m),
      he = this.k[D],
      F = this.k[D + 1],
      V = n[D],
      S = n[D + 1],
      Y = n0(L, q, K, J, R, oe, he, F, V, S),
      le = i0(L, q, K, J, R, oe, he, F, V, S)
    ;((L = l0(i, s)), (q = h0(i, s)), (K = u0(i, s, a, o, l)), (J = c0(i, s, a, o, l, p)))
    var Z = Zi(L, q, K, J),
      pe = Ji(L, q, K, J)
    ;((A = T),
      (I = m),
      (T = x),
      (m = b),
      (x = E),
      (b = d),
      (E = Zi(g, v, Y, le)),
      (d = Ji(v, v, Y, le)),
      (g = l),
      (v = p),
      (l = a),
      (p = o),
      (a = i),
      (o = s),
      (i = Zi(Y, le, Z, pe)),
      (s = Ji(Y, le, Z, pe)))
  }
  ;(Ot(this.h, 0, i, s),
    Ot(this.h, 2, a, o),
    Ot(this.h, 4, l, p),
    Ot(this.h, 6, g, v),
    Ot(this.h, 8, E, d),
    Ot(this.h, 10, x, b),
    Ot(this.h, 12, T, m),
    Ot(this.h, 14, A, I))
}
tt.prototype._digest = function (e) {
  return e === 'hex' ? je.toHex32(this.h, 'big') : je.split32(this.h, 'big')
}
function o0(t, e, r, n, i) {
  var s = (t & r) ^ (~t & i)
  return (s < 0 && (s += 4294967296), s)
}
function a0(t, e, r, n, i, s) {
  var a = (e & n) ^ (~e & s)
  return (a < 0 && (a += 4294967296), a)
}
function u0(t, e, r, n, i) {
  var s = (t & r) ^ (t & i) ^ (r & i)
  return (s < 0 && (s += 4294967296), s)
}
function c0(t, e, r, n, i, s) {
  var a = (e & n) ^ (e & s) ^ (n & s)
  return (a < 0 && (a += 4294967296), a)
}
function l0(t, e) {
  var r = ft(t, e, 28),
    n = ft(e, t, 2),
    i = ft(e, t, 7),
    s = r ^ n ^ i
  return (s < 0 && (s += 4294967296), s)
}
function h0(t, e) {
  var r = dt(t, e, 28),
    n = dt(e, t, 2),
    i = dt(e, t, 7),
    s = r ^ n ^ i
  return (s < 0 && (s += 4294967296), s)
}
function f0(t, e) {
  var r = ft(t, e, 14),
    n = ft(t, e, 18),
    i = ft(e, t, 9),
    s = r ^ n ^ i
  return (s < 0 && (s += 4294967296), s)
}
function d0(t, e) {
  var r = dt(t, e, 14),
    n = dt(t, e, 18),
    i = dt(e, t, 9),
    s = r ^ n ^ i
  return (s < 0 && (s += 4294967296), s)
}
function p0(t, e) {
  var r = ft(t, e, 1),
    n = ft(t, e, 8),
    i = Ld(t, e, 7),
    s = r ^ n ^ i
  return (s < 0 && (s += 4294967296), s)
}
function m0(t, e) {
  var r = dt(t, e, 1),
    n = dt(t, e, 8),
    i = Bd(t, e, 7),
    s = r ^ n ^ i
  return (s < 0 && (s += 4294967296), s)
}
function w0(t, e) {
  var r = ft(t, e, 19),
    n = ft(e, t, 29),
    i = Ld(t, e, 6),
    s = r ^ n ^ i
  return (s < 0 && (s += 4294967296), s)
}
function g0(t, e) {
  var r = dt(t, e, 19),
    n = dt(e, t, 29),
    i = Bd(t, e, 6),
    s = r ^ n ^ i
  return (s < 0 && (s += 4294967296), s)
}
var Fs = Ee,
  Md = Ud
function Rt() {
  if (!(this instanceof Rt)) return new Rt()
  ;(Md.call(this),
    (this.h = [
      3418070365, 3238371032, 1654270250, 914150663, 2438529370, 812702999, 355462360, 4144912697,
      1731405415, 4290775857, 2394180231, 1750603025, 3675008525, 1694076839, 1203062813,
      3204075428,
    ]))
}
Fs.inherits(Rt, Md)
var y0 = Rt
Rt.blockSize = 1024
Rt.outSize = 384
Rt.hmacStrength = 192
Rt.padLength = 128
Rt.prototype._digest = function (e) {
  return e === 'hex'
    ? Fs.toHex32(this.h.slice(0, 12), 'big')
    : Fs.split32(this.h.slice(0, 12), 'big')
}
gr.sha1 = Hw
gr.sha224 = Jw
gr.sha256 = Dd
gr.sha384 = y0
gr.sha512 = Ud
var Hd = {},
  Wt = Ee,
  v0 = wr,
  Yr = Wt.rotl32,
  mh = Wt.sum32,
  Tr = Wt.sum32_3,
  wh = Wt.sum32_4,
  Wd = v0.BlockHash
function gt() {
  if (!(this instanceof gt)) return new gt()
  ;(Wd.call(this),
    (this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520]),
    (this.endian = 'little'))
}
Wt.inherits(gt, Wd)
Hd.ripemd160 = gt
gt.blockSize = 512
gt.outSize = 160
gt.hmacStrength = 192
gt.padLength = 64
gt.prototype._update = function (e, r) {
  for (
    var n = this.h[0],
      i = this.h[1],
      s = this.h[2],
      a = this.h[3],
      o = this.h[4],
      l = n,
      p = i,
      g = s,
      v = a,
      E = o,
      d = 0;
    d < 80;
    d++
  ) {
    var x = mh(Yr(wh(n, gh(d, i, s, a), e[E0[d] + r], _0(d)), T0[d]), o)
    ;((n = o),
      (o = a),
      (a = Yr(s, 10)),
      (s = i),
      (i = x),
      (x = mh(Yr(wh(l, gh(79 - d, p, g, v), e[x0[d] + r], b0(d)), A0[d]), E)),
      (l = E),
      (E = v),
      (v = Yr(g, 10)),
      (g = p),
      (p = x))
  }
  ;((x = Tr(this.h[1], s, v)),
    (this.h[1] = Tr(this.h[2], a, E)),
    (this.h[2] = Tr(this.h[3], o, l)),
    (this.h[3] = Tr(this.h[4], n, p)),
    (this.h[4] = Tr(this.h[0], i, g)),
    (this.h[0] = x))
}
gt.prototype._digest = function (e) {
  return e === 'hex' ? Wt.toHex32(this.h, 'little') : Wt.split32(this.h, 'little')
}
function gh(t, e, r, n) {
  return t <= 15
    ? e ^ r ^ n
    : t <= 31
      ? (e & r) | (~e & n)
      : t <= 47
        ? (e | ~r) ^ n
        : t <= 63
          ? (e & n) | (r & ~n)
          : e ^ (r | ~n)
}
function _0(t) {
  return t <= 15
    ? 0
    : t <= 31
      ? 1518500249
      : t <= 47
        ? 1859775393
        : t <= 63
          ? 2400959708
          : 2840853838
}
function b0(t) {
  return t <= 15
    ? 1352829926
    : t <= 31
      ? 1548603684
      : t <= 47
        ? 1836072691
        : t <= 63
          ? 2053994217
          : 0
}
var E0 = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2,
    14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13,
    3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13,
  ],
  x0 = [
    5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12,
    4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5,
    12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11,
  ],
  T0 = [
    11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9,
    11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15,
    9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6,
  ],
  A0 = [
    8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7,
    6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6,
    14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11,
  ],
  S0 = Ee,
  I0 = zr
function lr(t, e, r) {
  if (!(this instanceof lr)) return new lr(t, e, r)
  ;((this.Hash = t),
    (this.blockSize = t.blockSize / 8),
    (this.outSize = t.outSize / 8),
    (this.inner = null),
    (this.outer = null),
    this._init(S0.toArray(e, r)))
}
var R0 = lr
lr.prototype._init = function (e) {
  ;(e.length > this.blockSize && (e = new this.Hash().update(e).digest()),
    I0(e.length <= this.blockSize))
  for (var r = e.length; r < this.blockSize; r++) e.push(0)
  for (r = 0; r < e.length; r++) e[r] ^= 54
  for (this.inner = new this.Hash().update(e), r = 0; r < e.length; r++) e[r] ^= 106
  this.outer = new this.Hash().update(e)
}
lr.prototype.update = function (e, r) {
  return (this.inner.update(e, r), this)
}
lr.prototype.digest = function (e) {
  return (this.outer.update(this.inner.digest()), this.outer.digest(e))
}
;(function (t) {
  var e = t
  ;((e.utils = Ee),
    (e.common = wr),
    (e.sha = gr),
    (e.ripemd = Hd),
    (e.hmac = R0),
    (e.sha1 = e.sha.sha1),
    (e.sha256 = e.sha.sha256),
    (e.sha224 = e.sha.sha224),
    (e.sha384 = e.sha.sha384),
    (e.sha512 = e.sha.sha512),
    (e.ripemd160 = e.ripemd.ripemd160))
})(xd)
var N0 = Fc(xd),
  Kg = (t) => Math.floor((t / 25.4) * 72 * 20),
  Ze = (t) => Math.floor(t * 72 * 20),
  Yn = (t = 0) => {
    let e = t
    return () => ++e
  },
  k0 = () => Yn(),
  C0 = () => Yn(1),
  O0 = () => Yn(),
  D0 = () => Yn(),
  Xc = () => rw().toLowerCase(),
  yh = (t) =>
    N0.sha1()
      .update(t instanceof ArrayBuffer ? new Uint8Array(t) : t)
      .digest('hex'),
  Ar = (t) => tw('1234567890abcdef', t)(),
  F0 = () => `${Ar(8)}-${Ar(4)}-${Ar(4)}-${Ar(4)}-${Ar(12)}`,
  L0 = {
    CHARACTER: 'character',
    COLUMN: 'column',
    INSIDE_MARGIN: 'insideMargin',
    LEFT_MARGIN: 'leftMargin',
    MARGIN: 'margin',
    OUTSIDE_MARGIN: 'outsideMargin',
    PAGE: 'page',
    RIGHT_MARGIN: 'rightMargin',
  },
  B0 = {
    BOTTOM_MARGIN: 'bottomMargin',
    INSIDE_MARGIN: 'insideMargin',
    LINE: 'line',
    MARGIN: 'margin',
    OUTSIDE_MARGIN: 'outsideMargin',
    PAGE: 'page',
    PARAGRAPH: 'paragraph',
    TOP_MARGIN: 'topMargin',
  },
  Ls = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { x: 'x', y: 'y' }))
    }
  },
  Bs = class extends M {
    constructor() {
      ;(super('wp:simplePos'), this.root.push(new Ls({ x: 0, y: 0 })))
    }
  },
  un = class extends M {
    constructor(e) {
      ;(super('wp:align'), this.root.push(e))
    }
  },
  cn = class extends M {
    constructor(e) {
      ;(super('wp:posOffset'), this.root.push(e.toString()))
    }
  },
  Ps = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { relativeFrom: 'relativeFrom' }))
    }
  },
  Us = class extends M {
    constructor(e) {
      if (
        (super('wp:positionH'),
        this.root.push(new Ps({ relativeFrom: e.relative || L0.PAGE })),
        e.align)
      )
        this.root.push(new un(e.align))
      else if (e.offset !== void 0) this.root.push(new cn(e.offset))
      else
        throw new Error(
          'There is no configuration provided for floating position (Align or offset)',
        )
    }
  },
  Ms = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { relativeFrom: 'relativeFrom' }))
    }
  },
  Hs = class extends M {
    constructor(e) {
      if (
        (super('wp:positionV'),
        this.root.push(new Ms({ relativeFrom: e.relative || B0.PAGE })),
        e.align)
      )
        this.root.push(new un(e.align))
      else if (e.offset !== void 0) this.root.push(new cn(e.offset))
      else
        throw new Error(
          'There is no configuration provided for floating position (Align or offset)',
        )
    }
  },
  Ws = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { uri: 'uri' }))
    }
  },
  P0 = (t) =>
    new Ie({
      name: 'asvg:svgBlip',
      attributes: {
        asvg: {
          key: 'xmlns:asvg',
          value: 'http://schemas.microsoft.com/office/drawing/2016/SVG/main',
        },
        embed: { key: 'r:embed', value: `rId{${t.fileName}}` },
      },
    }),
  U0 = (t) =>
    new Ie({
      name: 'a:ext',
      attributes: { uri: { key: 'uri', value: '{96DAC541-7B7A-43D3-8B79-37D633B846F1}' } },
      children: [P0(t)],
    }),
  M0 = (t) => new Ie({ name: 'a:extLst', children: [U0(t)] }),
  H0 = (t) =>
    new Ie({
      name: 'a:blip',
      attributes: {
        embed: {
          key: 'r:embed',
          value: `rId{${t.type === 'svg' ? t.fallback.fileName : t.fileName}}`,
        },
        cstate: { key: 'cstate', value: 'none' },
      },
      children: t.type === 'svg' ? [M0(t)] : [],
    }),
  zs = class extends M {
    constructor() {
      super('a:srcRect')
    }
  },
  js = class extends M {
    constructor() {
      super('a:fillRect')
    }
  },
  Gs = class extends M {
    constructor() {
      ;(super('a:stretch'), this.root.push(new js()))
    }
  },
  Ks = class extends M {
    constructor(e) {
      ;(super('pic:blipFill'),
        this.root.push(H0(e)),
        this.root.push(new zs()),
        this.root.push(new Gs()))
    }
  },
  $s = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          noChangeAspect: 'noChangeAspect',
          noChangeArrowheads: 'noChangeArrowheads',
        }))
    }
  },
  Vs = class extends M {
    constructor() {
      ;(super('a:picLocks'), this.root.push(new $s({ noChangeAspect: 1, noChangeArrowheads: 1 })))
    }
  },
  qs = class extends M {
    constructor() {
      ;(super('pic:cNvPicPr'), this.root.push(new Vs()))
    }
  },
  zd = (t, e) =>
    new Ie({
      name: 'a:hlinkClick',
      attributes: Ue(
        ye(
          {},
          e
            ? {
                xmlns: {
                  key: 'xmlns:a',
                  value: 'http://schemas.openxmlformats.org/drawingml/2006/main',
                },
              }
            : {},
        ),
        { id: { key: 'r:id', value: `rId${t}` } },
      ),
    }),
  Xs = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { id: 'id', name: 'name', descr: 'descr' }))
    }
  },
  Ys = class extends M {
    constructor() {
      ;(super('pic:cNvPr'), this.root.push(new Xs({ id: 0, name: '', descr: '' })))
    }
    prepForXml(e) {
      for (let r = e.stack.length - 1; r >= 0; r--) {
        let n = e.stack[r]
        if (n instanceof zt) {
          this.root.push(zd(n.linkId, !1))
          break
        }
      }
      return super.prepForXml(e)
    }
  },
  Zs = class extends M {
    constructor() {
      ;(super('pic:nvPicPr'), this.root.push(new Ys()), this.root.push(new qs()))
    }
  },
  Js = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { xmlns: 'xmlns:pic' }))
    }
  },
  Qs = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { cx: 'cx', cy: 'cy' }))
    }
  },
  eo = class extends M {
    constructor(e, r) {
      ;(super('a:ext'),
        $(this, 'attributes'),
        (this.attributes = new Qs({ cx: e, cy: r })),
        this.root.push(this.attributes))
    }
  },
  to = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { x: 'x', y: 'y' }))
    }
  },
  ro = class extends M {
    constructor() {
      ;(super('a:off'), this.root.push(new to({ x: 0, y: 0 })))
    }
  },
  no = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { flipVertical: 'flipV', flipHorizontal: 'flipH', rotation: 'rot' }))
    }
  },
  io = class extends M {
    constructor(e) {
      var r, n
      ;(super('a:xfrm'),
        $(this, 'extents'),
        this.root.push(
          new no({
            flipVertical: (r = e.flip) == null ? void 0 : r.vertical,
            flipHorizontal: (n = e.flip) == null ? void 0 : n.horizontal,
            rotation: e.rotation,
          }),
        ),
        (this.extents = new eo(e.emus.x, e.emus.y)),
        this.root.push(new ro()),
        this.root.push(this.extents))
    }
  },
  jd = () => new Ie({ name: 'a:noFill' }),
  W0 = (t) =>
    new Ie({ name: 'a:schemeClr', attributes: { value: { key: 'val', value: t.value } } }),
  z0 = (t) => new Ie({ name: 'a:srgbClr', attributes: { value: { key: 'val', value: t.value } } }),
  vh = (t) => new Ie({ name: 'a:solidFill', children: [t.type === 'rgb' ? z0(t) : W0(t)] }),
  j0 = (t) =>
    new Ie({
      name: 'a:ln',
      attributes: {
        width: { key: 'w', value: t.width },
        cap: { key: 'cap', value: t.cap },
        compoundLine: { key: 'cmpd', value: t.compoundLine },
        align: { key: 'algn', value: t.align },
      },
      children: [
        t.type === 'noFill'
          ? jd()
          : t.solidFillType === 'rgb'
            ? vh({ type: 'rgb', value: t.value })
            : vh({ type: 'scheme', value: t.value }),
      ],
    }),
  so = class extends M {
    constructor() {
      super('a:avLst')
    }
  },
  oo = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { prst: 'prst' }))
    }
  },
  ao = class extends M {
    constructor() {
      ;(super('a:prstGeom'), this.root.push(new oo({ prst: 'rect' })), this.root.push(new so()))
    }
  },
  uo = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { bwMode: 'bwMode' }))
    }
  },
  co = class extends M {
    constructor({ outline: e, transform: r }) {
      ;(super('pic:spPr'),
        $(this, 'form'),
        this.root.push(new uo({ bwMode: 'auto' })),
        (this.form = new io(r)),
        this.root.push(this.form),
        this.root.push(new ao()),
        e && (this.root.push(jd()), this.root.push(j0(e))))
    }
  },
  lo = class extends M {
    constructor({ mediaData: e, transform: r, outline: n }) {
      ;(super('pic:pic'),
        this.root.push(
          new Js({ xmlns: 'http://schemas.openxmlformats.org/drawingml/2006/picture' }),
        ),
        this.root.push(new Zs()),
        this.root.push(new Ks(e)),
        this.root.push(new co({ transform: r, outline: n })))
    }
  },
  ho = class extends M {
    constructor({ mediaData: e, transform: r, outline: n }) {
      ;(super('a:graphicData'),
        $(this, 'pic'),
        this.root.push(new Ws({ uri: 'http://schemas.openxmlformats.org/drawingml/2006/picture' })),
        (this.pic = new lo({ mediaData: e, transform: r, outline: n })),
        this.root.push(this.pic))
    }
  },
  fo = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { a: 'xmlns:a' }))
    }
  },
  ln = class extends M {
    constructor({ mediaData: e, transform: r, outline: n }) {
      ;(super('a:graphic'),
        $(this, 'data'),
        this.root.push(new fo({ a: 'http://schemas.openxmlformats.org/drawingml/2006/main' })),
        (this.data = new ho({ mediaData: e, transform: r, outline: n })),
        this.root.push(this.data))
    }
  },
  Zr = { NONE: 0, SQUARE: 1, TIGHT: 2, TOP_AND_BOTTOM: 3 },
  G0 = { BOTH_SIDES: 'bothSides', LEFT: 'left', RIGHT: 'right', LARGEST: 'largest' },
  hn = class extends M {
    constructor() {
      super('wp:wrapNone')
    }
  },
  po = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          distT: 'distT',
          distB: 'distB',
          distL: 'distL',
          distR: 'distR',
          wrapText: 'wrapText',
        }))
    }
  },
  mo = class extends M {
    constructor(e, r = { top: 0, bottom: 0, left: 0, right: 0 }) {
      ;(super('wp:wrapSquare'),
        this.root.push(
          new po({
            wrapText: e.side || G0.BOTH_SIDES,
            distT: r.top,
            distB: r.bottom,
            distL: r.left,
            distR: r.right,
          }),
        ))
    }
  },
  wo = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { distT: 'distT', distB: 'distB' }))
    }
  },
  go = class extends M {
    constructor(e = { top: 0, bottom: 0 }) {
      ;(super('wp:wrapTight'), this.root.push(new wo({ distT: e.top, distB: e.bottom })))
    }
  },
  yo = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { distT: 'distT', distB: 'distB' }))
    }
  },
  vo = class extends M {
    constructor(e = { top: 0, bottom: 0 }) {
      ;(super('wp:wrapTopAndBottom'), this.root.push(new yo({ distT: e.top, distB: e.bottom })))
    }
  },
  fn = class extends M {
    constructor({ name: e, description: r, title: n } = { name: '', description: '', title: '' }) {
      ;(super('wp:docPr'),
        $(this, 'docPropertiesUniqueNumericId', O0()),
        this.root.push(
          new Ge({
            id: { key: 'id', value: this.docPropertiesUniqueNumericId() },
            name: { key: 'name', value: e },
            description: { key: 'descr', value: r },
            title: { key: 'title', value: n },
          }),
        ))
    }
    prepForXml(e) {
      for (let r = e.stack.length - 1; r >= 0; r--) {
        let n = e.stack[r]
        if (n instanceof zt) {
          this.root.push(zd(n.linkId, !0))
          break
        }
      }
      return super.prepForXml(e)
    }
  },
  Gd = ({ top: t, right: e, bottom: r, left: n }) =>
    new Ie({
      name: 'wp:effectExtent',
      attributes: {
        top: { key: 't', value: t },
        right: { key: 'r', value: e },
        bottom: { key: 'b', value: r },
        left: { key: 'l', value: n },
      },
    }),
  _o = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { cx: 'cx', cy: 'cy' }))
    }
  },
  dn = class extends M {
    constructor(e, r) {
      ;(super('wp:extent'),
        $(this, 'attributes'),
        (this.attributes = new _o({ cx: e, cy: r })),
        this.root.push(this.attributes))
    }
  },
  bo = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { xmlns: 'xmlns:a', noChangeAspect: 'noChangeAspect' }))
    }
  },
  Eo = class extends M {
    constructor() {
      ;(super('a:graphicFrameLocks'),
        this.root.push(
          new bo({
            xmlns: 'http://schemas.openxmlformats.org/drawingml/2006/main',
            noChangeAspect: 1,
          }),
        ))
    }
  },
  pn = class extends M {
    constructor() {
      ;(super('wp:cNvGraphicFramePr'), this.root.push(new Eo()))
    }
  },
  xo = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          distT: 'distT',
          distB: 'distB',
          distL: 'distL',
          distR: 'distR',
          allowOverlap: 'allowOverlap',
          behindDoc: 'behindDoc',
          layoutInCell: 'layoutInCell',
          locked: 'locked',
          relativeHeight: 'relativeHeight',
          simplePos: 'simplePos',
        }))
    }
  },
  To = class extends M {
    constructor({ mediaData: e, transform: r, drawingOptions: n }) {
      super('wp:anchor')
      let i = ye(
        {
          allowOverlap: !0,
          behindDocument: !1,
          lockAnchor: !1,
          layoutInCell: !0,
          verticalPosition: {},
          horizontalPosition: {},
        },
        n.floating,
      )
      if (
        (this.root.push(
          new xo({
            distT: (i.margins && i.margins.top) || 0,
            distB: (i.margins && i.margins.bottom) || 0,
            distL: (i.margins && i.margins.left) || 0,
            distR: (i.margins && i.margins.right) || 0,
            simplePos: '0',
            allowOverlap: i.allowOverlap === !0 ? '1' : '0',
            behindDoc: i.behindDocument === !0 ? '1' : '0',
            locked: i.lockAnchor === !0 ? '1' : '0',
            layoutInCell: i.layoutInCell === !0 ? '1' : '0',
            relativeHeight: i.zIndex ? i.zIndex : r.emus.y,
          }),
        ),
        this.root.push(new Bs()),
        this.root.push(new Us(i.horizontalPosition)),
        this.root.push(new Hs(i.verticalPosition)),
        this.root.push(new dn(r.emus.x, r.emus.y)),
        this.root.push(Gd({ top: 0, right: 0, bottom: 0, left: 0 })),
        n.floating !== void 0 && n.floating.wrap !== void 0)
      )
        switch (n.floating.wrap.type) {
          case Zr.SQUARE:
            this.root.push(new mo(n.floating.wrap, n.floating.margins))
            break
          case Zr.TIGHT:
            this.root.push(new go(n.floating.margins))
            break
          case Zr.TOP_AND_BOTTOM:
            this.root.push(new vo(n.floating.margins))
            break
          case Zr.NONE:
          default:
            this.root.push(new hn())
        }
      else this.root.push(new hn())
      ;(this.root.push(new fn(n.docProperties)),
        this.root.push(new pn()),
        this.root.push(new ln({ mediaData: e, transform: r, outline: n.outline })))
    }
  },
  K0 = ({ mediaData: t, transform: e, docProperties: r, outline: n }) => {
    var i, s, a, o
    return new Ie({
      name: 'wp:inline',
      attributes: {
        distanceTop: { key: 'distT', value: 0 },
        distanceBottom: { key: 'distB', value: 0 },
        distanceLeft: { key: 'distL', value: 0 },
        distanceRight: { key: 'distR', value: 0 },
      },
      children: [
        new dn(e.emus.x, e.emus.y),
        Gd(
          n
            ? {
                top: ((i = n.width) != null ? i : 9525) * 2,
                right: ((s = n.width) != null ? s : 9525) * 2,
                bottom: ((a = n.width) != null ? a : 9525) * 2,
                left: ((o = n.width) != null ? o : 9525) * 2,
              }
            : { top: 0, right: 0, bottom: 0, left: 0 },
        ),
        new fn(r),
        new pn(),
        new ln({ mediaData: t, transform: e, outline: n }),
      ],
    })
  },
  Ao = class extends M {
    constructor(e, r = {}) {
      ;(super('w:drawing'),
        r.floating
          ? this.root.push(new To({ mediaData: e, transform: e.transformation, drawingOptions: r }))
          : this.root.push(
              K0({
                mediaData: e,
                transform: e.transformation,
                docProperties: r.docProperties,
                outline: r.outline,
              }),
            ))
    }
  },
  $0 = (t) => {
    if (typeof atob == 'function') {
      let e = ';base64,',
        r = t.indexOf(e),
        n = r === -1 ? 0 : r + e.length
      return new Uint8Array(
        atob(t.substring(n))
          .split('')
          .map((i) => i.charCodeAt(0)),
      )
    } else {
      let e = wl()
      return new e.Buffer(t, 'base64')
    }
  },
  V0 = (t) => (typeof t == 'string' ? $0(t) : t),
  Qi = (t, e) => ({
    data: V0(t.data),
    fileName: e,
    transformation: {
      pixels: { x: Math.round(t.transformation.width), y: Math.round(t.transformation.height) },
      emus: {
        x: Math.round(t.transformation.width * 9525),
        y: Math.round(t.transformation.height * 9525),
      },
      flip: t.transformation.flip,
      rotation: t.transformation.rotation ? t.transformation.rotation * 6e4 : void 0,
    },
  }),
  _h = class extends He {
    constructor(e) {
      ;(super({}), $(this, 'imageData'))
      let n = `${yh(e.data)}.${e.type}`
      this.imageData =
        e.type === 'svg'
          ? Ue(ye({ type: e.type }, Qi(e, n)), {
              fallback: ye(
                { type: e.fallback.type },
                Qi(
                  Ue(ye({}, e.fallback), { transformation: e.transformation }),
                  `${yh(e.fallback.data)}.${e.fallback.type}`,
                ),
              ),
            })
          : ye({ type: e.type }, Qi(e, n))
      let i = new Ao(this.imageData, {
        floating: e.floating,
        docProperties: e.altText,
        outline: e.outline,
      })
      this.root.push(i)
    }
    prepForXml(e) {
      return (
        e.file.Media.addImage(this.imageData.fileName, this.imageData),
        this.imageData.type === 'svg' &&
          e.file.Media.addImage(this.imageData.fallback.fileName, this.imageData.fallback),
        super.prepForXml(e)
      )
    }
  },
  So = class extends M {
    constructor(e) {
      ;(super('w:instrText'),
        this.root.push(new Me({ space: Ke.PRESERVE })),
        this.root.push(`SEQ ${e}`))
    }
  },
  bh = class extends He {
    constructor(e) {
      ;(super({}),
        this.root.push(new Ve(!0)),
        this.root.push(new So(e)),
        this.root.push(new Qe()),
        this.root.push(new qe()))
    }
  },
  Io = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { instr: 'w:instr' }))
    }
  },
  Ro = class extends M {
    constructor(e, r) {
      ;(super('w:fldSimple'),
        this.root.push(new Io({ instr: e })),
        r !== void 0 && this.root.push(new ar(r)))
    }
  },
  Eh = class extends Ro {
    constructor(e) {
      super(` MERGEFIELD ${e} `, `\xAB${e}\xBB`)
    }
  },
  No = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          id: 'w:id',
          initials: 'w:initials',
          author: 'w:author',
          date: 'w:date',
        }))
    }
  },
  Pr = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { id: 'w:id' }))
    }
  },
  ko = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          'xmlns:cx': 'xmlns:cx',
          'xmlns:cx1': 'xmlns:cx1',
          'xmlns:cx2': 'xmlns:cx2',
          'xmlns:cx3': 'xmlns:cx3',
          'xmlns:cx4': 'xmlns:cx4',
          'xmlns:cx5': 'xmlns:cx5',
          'xmlns:cx6': 'xmlns:cx6',
          'xmlns:cx7': 'xmlns:cx7',
          'xmlns:cx8': 'xmlns:cx8',
          'xmlns:mc': 'xmlns:mc',
          'xmlns:aink': 'xmlns:aink',
          'xmlns:am3d': 'xmlns:am3d',
          'xmlns:o': 'xmlns:o',
          'xmlns:r': 'xmlns:r',
          'xmlns:m': 'xmlns:m',
          'xmlns:v': 'xmlns:v',
          'xmlns:wp14': 'xmlns:wp14',
          'xmlns:wp': 'xmlns:wp',
          'xmlns:w10': 'xmlns:w10',
          'xmlns:w': 'xmlns:w',
          'xmlns:w14': 'xmlns:w14',
          'xmlns:w15': 'xmlns:w15',
          'xmlns:w16cex': 'xmlns:w16cex',
          'xmlns:w16cid': 'xmlns:w16cid',
          'xmlns:w16': 'xmlns:w16',
          'xmlns:w16sdtdh': 'xmlns:w16sdtdh',
          'xmlns:w16se': 'xmlns:w16se',
          'xmlns:wpg': 'xmlns:wpg',
          'xmlns:wpi': 'xmlns:wpi',
          'xmlns:wne': 'xmlns:wne',
          'xmlns:wps': 'xmlns:wps',
        }))
    }
  },
  xh = class extends M {
    constructor(e) {
      ;(super('w:commentRangeStart'), this.root.push(new Pr({ id: e })))
    }
  },
  Th = class extends M {
    constructor(e) {
      ;(super('w:commentRangeEnd'), this.root.push(new Pr({ id: e })))
    }
  },
  Ah = class extends M {
    constructor(e) {
      ;(super('w:commentReference'), this.root.push(new Pr({ id: e })))
    }
  },
  Co = class extends M {
    constructor({ id: e, initials: r, author: n, date: i = new Date(), children: s }) {
      ;(super('w:comment'),
        this.root.push(new No({ id: e, initials: r, author: n, date: i.toISOString() })))
      for (let a of s) this.root.push(a)
    }
  },
  Oo = class extends M {
    constructor({ children: e }) {
      ;(super('w:comments'),
        this.root.push(
          new ko({
            'xmlns:cx': 'http://schemas.microsoft.com/office/drawing/2014/chartex',
            'xmlns:cx1': 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
            'xmlns:cx2': 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
            'xmlns:cx3': 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
            'xmlns:cx4': 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
            'xmlns:cx5': 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
            'xmlns:cx6': 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
            'xmlns:cx7': 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
            'xmlns:cx8': 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
            'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
            'xmlns:aink': 'http://schemas.microsoft.com/office/drawing/2016/ink',
            'xmlns:am3d': 'http://schemas.microsoft.com/office/drawing/2017/model3d',
            'xmlns:o': 'urn:schemas-microsoft-com:office:office',
            'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
            'xmlns:m': 'http://schemas.openxmlformats.org/officeDocument/2006/math',
            'xmlns:v': 'urn:schemas-microsoft-com:vml',
            'xmlns:wp14': 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
            'xmlns:wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
            'xmlns:w10': 'urn:schemas-microsoft-com:office:word',
            'xmlns:w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
            'xmlns:w14': 'http://schemas.microsoft.com/office/word/2010/wordml',
            'xmlns:w15': 'http://schemas.microsoft.com/office/word/2012/wordml',
            'xmlns:w16cex': 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
            'xmlns:w16cid': 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
            'xmlns:w16': 'http://schemas.microsoft.com/office/word/2018/wordml',
            'xmlns:w16sdtdh': 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
            'xmlns:w16se': 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
            'xmlns:wpg': 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
            'xmlns:wpi': 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
            'xmlns:wne': 'http://schemas.microsoft.com/office/word/2006/wordml',
            'xmlns:wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
          }),
        ))
      for (let r of e) this.root.push(new Co(r))
    }
  },
  Sh = class extends Ce {
    constructor() {
      super('w:noBreakHyphen')
    }
  },
  Ih = class extends Ce {
    constructor() {
      super('w:softHyphen')
    }
  },
  Rh = class extends Ce {
    constructor() {
      super('w:dayShort')
    }
  },
  Nh = class extends Ce {
    constructor() {
      super('w:monthShort')
    }
  },
  kh = class extends Ce {
    constructor() {
      super('w:yearShort')
    }
  },
  Ch = class extends Ce {
    constructor() {
      super('w:dayLong')
    }
  },
  Oh = class extends Ce {
    constructor() {
      super('w:monthLong')
    }
  },
  Dh = class extends Ce {
    constructor() {
      super('w:yearLong')
    }
  },
  Fh = class extends Ce {
    constructor() {
      super('w:annotationRef')
    }
  },
  Lh = class extends Ce {
    constructor() {
      super('w:footnoteRef')
    }
  },
  Bh = class extends Ce {
    constructor() {
      super('w:endnoteRef')
    }
  },
  Ph = class extends Ce {
    constructor() {
      super('w:separator')
    }
  },
  Uh = class extends Ce {
    constructor() {
      super('w:continuationSeparator')
    }
  },
  Mh = class extends Ce {
    constructor() {
      super('w:pgNum')
    }
  },
  Hh = class extends Ce {
    constructor() {
      super('w:cr')
    }
  },
  Wh = class extends Ce {
    constructor() {
      super('w:tab')
    }
  },
  zh = class extends Ce {
    constructor() {
      super('w:lastRenderedPageBreak')
    }
  },
  $g = { LEFT: 'left', CENTER: 'center', RIGHT: 'right' },
  Vg = { MARGIN: 'margin', INDENT: 'indent' },
  qg = {
    NONE: 'none',
    DOT: 'dot',
    HYPHEN: 'hyphen',
    UNDERSCORE: 'underscore',
    MIDDLE_DOT: 'middleDot',
  },
  jh = class extends M {
    constructor(e) {
      ;(super('w:ptab'),
        this.root.push(
          new Ge({
            alignment: { key: 'w:alignment', value: e.alignment },
            relativeTo: { key: 'w:relativeTo', value: e.relativeTo },
            leader: { key: 'w:leader', value: e.leader },
          }),
        ))
    }
  },
  Kd = { COLUMN: 'column', PAGE: 'page' },
  mn = class extends M {
    constructor(e) {
      ;(super('w:br'), this.root.push(new Ae({ type: e })))
    }
  },
  Gh = class extends He {
    constructor() {
      ;(super({}), this.root.push(new mn(Kd.PAGE)))
    }
  },
  Kh = class extends He {
    constructor() {
      ;(super({}), this.root.push(new mn(Kd.COLUMN)))
    }
  },
  Do = class extends M {
    constructor() {
      super('w:pageBreakBefore')
    }
  },
  Fo = { AT_LEAST: 'atLeast', EXACTLY: 'exactly', EXACT: 'exact', AUTO: 'auto' },
  Lo = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          after: 'w:after',
          before: 'w:before',
          line: 'w:line',
          lineRule: 'w:lineRule',
          beforeAutoSpacing: 'w:beforeAutospacing',
          afterAutoSpacing: 'w:afterAutoSpacing',
        }))
    }
  },
  Bo = class extends M {
    constructor(e) {
      ;(super('w:spacing'), this.root.push(new Lo(e)))
    }
  },
  Xg = {
    HEADING_1: 'Heading1',
    HEADING_2: 'Heading2',
    HEADING_3: 'Heading3',
    HEADING_4: 'Heading4',
    HEADING_5: 'Heading5',
    HEADING_6: 'Heading6',
    TITLE: 'Title',
  },
  Jr = class extends M {
    constructor(e) {
      ;(super('w:pStyle'), this.root.push(new Ae({ val: e })))
    }
  },
  Po = class extends M {
    constructor(e) {
      super('w:tabs')
      for (let r of e) this.root.push(new Mo(r))
    }
  },
  $h = {
    LEFT: 'left',
    RIGHT: 'right',
    CENTER: 'center',
    BAR: 'bar',
    CLEAR: 'clear',
    DECIMAL: 'decimal',
    END: 'end',
    NUM: 'num',
    START: 'start',
  },
  Zg = {
    DOT: 'dot',
    HYPHEN: 'hyphen',
    MIDDLE_DOT: 'middleDot',
    NONE: 'none',
    UNDERSCORE: 'underscore',
  },
  Jg = { MAX: 9026 },
  Uo = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val', pos: 'w:pos', leader: 'w:leader' }))
    }
  },
  Mo = class extends M {
    constructor({ type: e, position: r, leader: n }) {
      ;(super('w:tab'), this.root.push(new Uo({ val: e, pos: r, leader: n })))
    }
  },
  kr = class extends M {
    constructor(e, r) {
      ;(super('w:numPr'), this.root.push(new Ho(r)), this.root.push(new Wo(e)))
    }
  },
  Ho = class extends M {
    constructor(e) {
      if ((super('w:ilvl'), e > 9))
        throw new Error(
          'Level cannot be greater than 9. Read more here: https://answers.microsoft.com/en-us/msoffice/forum/all/does-word-support-more-than-9-list-levels/d130fdcd-1781-446d-8c84-c6c79124e4d7',
        )
      this.root.push(new Ae({ val: e }))
    }
  },
  Wo = class extends M {
    constructor(e) {
      ;(super('w:numId'), this.root.push(new Ae({ val: typeof e == 'string' ? `{${e}}` : e })))
    }
  },
  Ur = class extends M {
    constructor() {
      ;(super(...arguments), $(this, 'fileChild', Symbol()))
    }
  },
  zo = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { id: 'Id', type: 'Type', target: 'Target', targetMode: 'TargetMode' }))
    }
  },
  $d = { EXTERNAL: 'External' },
  jo = class extends M {
    constructor(e, r, n, i) {
      ;(super('Relationship'), this.root.push(new zo({ id: e, type: r, target: n, targetMode: i })))
    }
  },
  Go = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { id: 'r:id', history: 'w:history', anchor: 'w:anchor' }))
    }
  },
  Qg = { INTERNAL: 'INTERNAL', EXTERNAL: 'EXTERNAL' },
  zt = class extends M {
    constructor(e, r, n) {
      ;(super('w:hyperlink'), $(this, 'linkId'), (this.linkId = r))
      let i = { history: 1, anchor: n || void 0, id: n ? void 0 : `rId${this.linkId}` },
        s = new Go(i)
      ;(this.root.push(s),
        e.forEach((a) => {
          this.root.push(a)
        }))
    }
  },
  Vh = class extends zt {
    constructor(e) {
      super(e.children, Xc(), e.anchor)
    }
  },
  wn = class extends M {
    constructor(e) {
      ;(super('w:externalHyperlink'), (this.options = e))
    }
  },
  Ko = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { id: 'w:id', name: 'w:name' }))
    }
  },
  $o = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { id: 'w:id' }))
    }
  },
  Vo = class {
    constructor(e) {
      ;($(this, 'bookmarkUniqueNumericId', D0()),
        $(this, 'start'),
        $(this, 'children'),
        $(this, 'end'))
      let r = this.bookmarkUniqueNumericId()
      ;((this.start = new qo(e.id, r)), (this.children = e.children), (this.end = new Xo(r)))
    }
  },
  qo = class extends M {
    constructor(e, r) {
      super('w:bookmarkStart')
      let n = new Ko({ name: e, id: r })
      this.root.push(n)
    }
  },
  Xo = class extends M {
    constructor(e) {
      super('w:bookmarkEnd')
      let r = new $o({ id: e })
      this.root.push(r)
    }
  },
  Yo = class extends M {
    constructor(e) {
      ;(super('w:outlineLvl'), (this.level = e), this.root.push(new Ae({ val: e })))
    }
  },
  Zo = class extends M {
    constructor(e, r = {}) {
      ;(super('w:instrText'), this.root.push(new Me({ space: Ke.PRESERVE })))
      let n = `PAGEREF ${e}`
      ;(r.hyperlink && (n = `${n} \\h`),
        r.useRelativePosition && (n = `${n} \\p`),
        this.root.push(n))
    }
  },
  qh = class extends He {
    constructor(e, r = {}) {
      super({ children: [new Ve(!0), new Zo(e, r), new qe()] })
    }
  },
  ey = { BOTTOM: 'bottom', CENTER: 'center', TOP: 'top' },
  Jo = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { verticalAlign: 'w:val' }))
    }
  },
  gn = class extends M {
    constructor(e) {
      ;(super('w:vAlign'), this.root.push(new Jo({ verticalAlign: e })))
    }
  },
  tr = { DEFAULT: 'default', FIRST: 'first', EVEN: 'even' },
  Qo = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { type: 'w:type', id: 'r:id' }))
    }
  },
  Xh = { HEADER: 'w:headerReference', FOOTER: 'w:footerReference' },
  Cr = class extends M {
    constructor(e, r) {
      ;(super(e), this.root.push(new Qo({ type: r.type || tr.DEFAULT, id: `rId${r.id}` })))
    }
  },
  ea = class extends M {
    constructor({ space: e, count: r, separate: n, equalWidth: i, children: s }) {
      ;(super('w:cols'),
        this.root.push(
          new Ge({
            space: { key: 'w:space', value: e === void 0 ? void 0 : ke(e) },
            count: { key: 'w:num', value: r === void 0 ? void 0 : De(r) },
            separate: { key: 'w:sep', value: n },
            equalWidth: { key: 'w:equalWidth', value: i },
          }),
        ),
        !i && s && s.forEach((a) => this.addChildElement(a)))
    }
  },
  ty = {
    DEFAULT: 'default',
    LINES: 'lines',
    LINES_AND_CHARS: 'linesAndChars',
    SNAP_TO_CHARS: 'snapToChars',
  },
  ta = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { type: 'w:type', linePitch: 'w:linePitch', charSpace: 'w:charSpace' }))
    }
  },
  ra = class extends M {
    constructor(e, r, n) {
      ;(super('w:docGrid'),
        this.root.push(new ta({ type: n, linePitch: De(e), charSpace: r ? De(r) : void 0 })))
    }
  },
  ry = { NEW_PAGE: 'newPage', NEW_SECTION: 'newSection', CONTINUOUS: 'continuous' },
  q0 = ({ countBy: t, start: e, restart: r, distance: n }) =>
    new Ie({
      name: 'w:lnNumType',
      attributes: {
        countBy: { key: 'w:countBy', value: t === void 0 ? void 0 : De(t) },
        start: { key: 'w:start', value: e === void 0 ? void 0 : De(e) },
        restart: { key: 'w:restart', value: r },
        distance: { key: 'w:distance', value: n === void 0 ? void 0 : ke(n) },
      },
    }),
  ny = { ALL_PAGES: 'allPages', FIRST_PAGE: 'firstPage', NOT_FIRST_PAGE: 'notFirstPage' },
  iy = { PAGE: 'page', TEXT: 'text' },
  sy = { BACK: 'back', FRONT: 'front' },
  yn = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          display: 'w:display',
          offsetFrom: 'w:offsetFrom',
          zOrder: 'w:zOrder',
        }))
    }
  },
  na = class extends et {
    constructor(e) {
      if ((super('w:pgBorders'), !e)) return this
      ;(e.pageBorders
        ? this.root.push(
            new yn({
              display: e.pageBorders.display,
              offsetFrom: e.pageBorders.offsetFrom,
              zOrder: e.pageBorders.zOrder,
            }),
          )
        : this.root.push(new yn({})),
        e.pageBorderTop && this.root.push(new xe('w:top', e.pageBorderTop)),
        e.pageBorderLeft && this.root.push(new xe('w:left', e.pageBorderLeft)),
        e.pageBorderBottom && this.root.push(new xe('w:bottom', e.pageBorderBottom)),
        e.pageBorderRight && this.root.push(new xe('w:right', e.pageBorderRight)))
    }
  },
  ia = class extends M {
    constructor(e, r, n, i, s, a, o) {
      ;(super('w:pgMar'),
        this.root.push(
          new Ge({
            top: { key: 'w:top', value: At(e) },
            right: { key: 'w:right', value: ke(r) },
            bottom: { key: 'w:bottom', value: At(n) },
            left: { key: 'w:left', value: ke(i) },
            header: { key: 'w:header', value: ke(s) },
            footer: { key: 'w:footer', value: ke(a) },
            gutter: { key: 'w:gutter', value: ke(o) },
          }),
        ))
    }
  },
  oy = { HYPHEN: 'hyphen', PERIOD: 'period', COLON: 'colon', EM_DASH: 'emDash', EN_DASH: 'endash' },
  sa = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { start: 'w:start', formatType: 'w:fmt', separator: 'w:chapSep' }))
    }
  },
  oa = class extends M {
    constructor({ start: e, formatType: r, separator: n }) {
      ;(super('w:pgNumType'),
        this.root.push(
          new sa({ start: e === void 0 ? void 0 : De(e), formatType: r, separator: n }),
        ))
    }
  },
  Vd = { PORTRAIT: 'portrait', LANDSCAPE: 'landscape' },
  aa = class extends M {
    constructor(e, r, n) {
      super('w:pgSz')
      let i = n === Vd.LANDSCAPE,
        s = ke(e),
        a = ke(r)
      this.root.push(
        new Ge({
          width: { key: 'w:w', value: i ? a : s },
          height: { key: 'w:h', value: i ? s : a },
          orientation: { key: 'w:orient', value: n },
        }),
      )
    }
  },
  ay = { LEFT_TO_RIGHT_TOP_TO_BOTTOM: 'lrTb', TOP_TO_BOTTOM_RIGHT_TO_LEFT: 'tbRl' },
  ua = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val' }))
    }
  },
  ca = class extends M {
    constructor(e) {
      ;(super('w:textDirection'), this.root.push(new ua({ val: e })))
    }
  },
  uy = {
    NEXT_PAGE: 'nextPage',
    NEXT_COLUMN: 'nextColumn',
    CONTINUOUS: 'continuous',
    EVEN_PAGE: 'evenPage',
    ODD_PAGE: 'oddPage',
  },
  la = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val' }))
    }
  },
  ha = class extends M {
    constructor(e) {
      ;(super('w:type'), this.root.push(new la({ val: e })))
    }
  },
  Ut = { TOP: 1440, RIGHT: 1440, BOTTOM: 1440, LEFT: 1440, HEADER: 708, FOOTER: 708, GUTTER: 0 },
  es = { WIDTH: 11906, HEIGHT: 16838, ORIENTATION: Vd.PORTRAIT },
  fa = class extends M {
    constructor({
      page: {
        size: { width: e = es.WIDTH, height: r = es.HEIGHT, orientation: n = es.ORIENTATION } = {},
        margin: {
          top: i = Ut.TOP,
          right: s = Ut.RIGHT,
          bottom: a = Ut.BOTTOM,
          left: o = Ut.LEFT,
          header: l = Ut.HEADER,
          footer: p = Ut.FOOTER,
          gutter: g = Ut.GUTTER,
        } = {},
        pageNumbers: v = {},
        borders: E,
        textDirection: d,
      } = {},
      grid: { linePitch: x = 360, charSpace: b, type: T } = {},
      headerWrapperGroup: m = {},
      footerWrapperGroup: A = {},
      lineNumbers: I,
      titlePage: D,
      verticalAlign: L,
      column: q,
      type: K,
    } = {}) {
      ;(super('w:sectPr'),
        this.addHeaderFooterGroup(Xh.HEADER, m),
        this.addHeaderFooterGroup(Xh.FOOTER, A),
        K && this.root.push(new ha(K)),
        this.root.push(new aa(e, r, n)),
        this.root.push(new ia(i, s, a, o, l, p, g)),
        E && this.root.push(new na(E)),
        I && this.root.push(q0(I)),
        this.root.push(new oa(v)),
        q && this.root.push(new ea(q)),
        L && this.root.push(new gn(L)),
        D !== void 0 && this.root.push(new ae('w:titlePg', D)),
        d && this.root.push(new ca(d)),
        this.root.push(new ra(x, b, T)))
    }
    addHeaderFooterGroup(e, r) {
      ;(r.default &&
        this.root.push(new Cr(e, { type: tr.DEFAULT, id: r.default.View.ReferenceId })),
        r.first && this.root.push(new Cr(e, { type: tr.FIRST, id: r.first.View.ReferenceId })),
        r.even && this.root.push(new Cr(e, { type: tr.EVEN, id: r.even.View.ReferenceId })))
    }
  },
  da = class extends M {
    constructor() {
      ;(super('w:body'), $(this, 'sections', []))
    }
    addSection(e) {
      let r = this.sections.pop()
      ;(this.root.push(this.createSectionParagraph(r)), this.sections.push(new fa(e)))
    }
    prepForXml(e) {
      return (
        this.sections.length === 1 && (this.root.splice(0, 1), this.root.push(this.sections.pop())),
        super.prepForXml(e)
      )
    }
    push(e) {
      this.root.push(e)
    }
    createSectionParagraph(e) {
      let r = new Nt({}),
        n = new Ft({})
      return (n.push(e), r.addChildElement(n), r)
    }
  },
  Yh = class extends M {
    constructor({ width: e, space: r }) {
      ;(super('w:col'),
        this.root.push(
          new Ge({
            width: { key: 'w:w', value: ke(e) },
            space: { key: 'w:space', value: r === void 0 ? void 0 : ke(r) },
          }),
        ))
    }
  },
  jt = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          wpc: 'xmlns:wpc',
          mc: 'xmlns:mc',
          o: 'xmlns:o',
          r: 'xmlns:r',
          m: 'xmlns:m',
          v: 'xmlns:v',
          wp14: 'xmlns:wp14',
          wp: 'xmlns:wp',
          w10: 'xmlns:w10',
          w: 'xmlns:w',
          w14: 'xmlns:w14',
          w15: 'xmlns:w15',
          wpg: 'xmlns:wpg',
          wpi: 'xmlns:wpi',
          wne: 'xmlns:wne',
          wps: 'xmlns:wps',
          Ignorable: 'mc:Ignorable',
          cp: 'xmlns:cp',
          dc: 'xmlns:dc',
          dcterms: 'xmlns:dcterms',
          dcmitype: 'xmlns:dcmitype',
          xsi: 'xmlns:xsi',
          type: 'xsi:type',
          cx: 'xmlns:cx',
          cx1: 'xmlns:cx1',
          cx2: 'xmlns:cx2',
          cx3: 'xmlns:cx3',
          cx4: 'xmlns:cx4',
          cx5: 'xmlns:cx5',
          cx6: 'xmlns:cx6',
          cx7: 'xmlns:cx7',
          cx8: 'xmlns:cx8',
          aink: 'xmlns:aink',
          am3d: 'xmlns:am3d',
          w16cex: 'xmlns:w16cex',
          w16cid: 'xmlns:w16cid',
          w16: 'xmlns:w16',
          w16sdtdh: 'xmlns:w16sdtdh',
          w16se: 'xmlns:w16se',
        }))
    }
  },
  pa = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          color: 'w:color',
          themeColor: 'w:themeColor',
          themeShade: 'w:themeShade',
          themeTint: 'w:themeTint',
        }))
    }
  },
  ma = class extends M {
    constructor(e) {
      ;(super('w:background'),
        this.root.push(
          new pa({
            color: e.color === void 0 ? void 0 : ir(e.color),
            themeColor: e.themeColor,
            themeShade: e.themeShade === void 0 ? void 0 : hh(e.themeShade),
            themeTint: e.themeTint === void 0 ? void 0 : hh(e.themeTint),
          }),
        ))
    }
  },
  wa = class extends M {
    constructor(e) {
      ;(super('w:document'),
        $(this, 'body'),
        this.root.push(
          new jt({
            wpc: 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
            mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
            o: 'urn:schemas-microsoft-com:office:office',
            r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
            m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
            v: 'urn:schemas-microsoft-com:vml',
            wp14: 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
            wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
            w10: 'urn:schemas-microsoft-com:office:word',
            w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
            w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
            w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
            wpg: 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
            wpi: 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
            wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
            wps: 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
            cx: 'http://schemas.microsoft.com/office/drawing/2014/chartex',
            cx1: 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
            cx2: 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
            cx3: 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
            cx4: 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
            cx5: 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
            cx6: 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
            cx7: 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
            cx8: 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
            aink: 'http://schemas.microsoft.com/office/drawing/2016/ink',
            am3d: 'http://schemas.microsoft.com/office/drawing/2017/model3d',
            w16cex: 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
            w16cid: 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
            w16: 'http://schemas.microsoft.com/office/word/2018/wordml',
            w16sdtdh: 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
            w16se: 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
            Ignorable: 'w14 w15 wp14',
          }),
        ),
        (this.body = new da()),
        e.background && this.root.push(new ma(e.background)),
        this.root.push(this.body))
    }
    add(e) {
      return (this.body.push(e), this)
    }
    get Body() {
      return this.body
    }
  },
  ga = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { xmlns: 'xmlns' }))
    }
  },
  Dt = class extends M {
    constructor() {
      ;(super('Relationships'),
        this.root.push(
          new ga({ xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships' }),
        ))
    }
    createRelationship(e, r, n, i) {
      let s = new jo(`rId${e}`, r, n, i)
      return (this.root.push(s), s)
    }
    get RelationshipCount() {
      return this.root.length - 1
    }
  },
  vn = class {
    constructor(e) {
      ;($(this, 'document'),
        $(this, 'relationships'),
        (this.document = new wa(e)),
        (this.relationships = new Dt()))
    }
    get View() {
      return this.document
    }
    get Relationships() {
      return this.relationships
    }
  },
  ya = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val' }))
    }
  },
  va = class extends M {
    constructor() {
      ;(super('w:wordWrap'), this.root.push(new ya({ val: 0 })))
    }
  },
  cy = { NONE: 'none', DROP: 'drop', MARGIN: 'margin' },
  ly = { MARGIN: 'margin', PAGE: 'page', TEXT: 'text' },
  hy = {
    AROUND: 'around',
    AUTO: 'auto',
    NONE: 'none',
    NOT_BESIDE: 'notBeside',
    THROUGH: 'through',
    TIGHT: 'tight',
  },
  X0 = (t) => {
    var e, r
    return new Ie({
      name: 'w:framePr',
      attributes: {
        anchorLock: { key: 'w:anchorLock', value: t.anchorLock },
        dropCap: { key: 'w:dropCap', value: t.dropCap },
        width: { key: 'w:w', value: t.width },
        height: { key: 'w:h', value: t.height },
        x: { key: 'w:x', value: t.position ? t.position.x : void 0 },
        y: { key: 'w:y', value: t.position ? t.position.y : void 0 },
        anchorHorizontal: { key: 'w:hAnchor', value: t.anchor.horizontal },
        anchorVertical: { key: 'w:vAnchor', value: t.anchor.vertical },
        spaceHorizontal: { key: 'w:hSpace', value: (e = t.space) == null ? void 0 : e.horizontal },
        spaceVertical: { key: 'w:vSpace', value: (r = t.space) == null ? void 0 : r.vertical },
        rule: { key: 'w:hRule', value: t.rule },
        alignmentX: { key: 'w:xAlign', value: t.alignment ? t.alignment.x : void 0 },
        alignmentY: { key: 'w:yAlign', value: t.alignment ? t.alignment.y : void 0 },
        lines: { key: 'w:lines', value: t.lines },
        wrap: { key: 'w:wrap', value: t.wrap },
      },
    })
  },
  Ft = class extends et {
    constructor(e) {
      var r, n
      if ((super('w:pPr'), $(this, 'numberingReferences', []), !e)) return this
      ;(e.heading && this.push(new Jr(e.heading)),
        e.bullet && this.push(new Jr('ListParagraph')),
        e.numbering &&
          !e.style &&
          !e.heading &&
          (e.numbering.custom || this.push(new Jr('ListParagraph'))),
        e.style && this.push(new Jr(e.style)),
        e.keepNext !== void 0 && this.push(new ae('w:keepNext', e.keepNext)),
        e.keepLines !== void 0 && this.push(new ae('w:keepLines', e.keepLines)),
        e.pageBreakBefore && this.push(new Do()),
        e.frame && this.push(X0(e.frame)),
        e.widowControl !== void 0 && this.push(new ae('w:widowControl', e.widowControl)),
        e.bullet && this.push(new kr(1, e.bullet.level)),
        e.numbering
          ? (this.numberingReferences.push({
              reference: e.numbering.reference,
              instance: (r = e.numbering.instance) != null ? r : 0,
            }),
            this.push(
              new kr(
                `${e.numbering.reference}-${(n = e.numbering.instance) != null ? n : 0}`,
                e.numbering.level,
              ),
            ))
          : e.numbering === !1 && this.push(new kr(0, 0)),
        e.border && this.push(new ps(e.border)),
        e.thematicBreak && this.push(new ms()),
        e.shading && this.push(new sr(e.shading)),
        e.wordWrap && this.push(new va()),
        e.overflowPunctuation && this.push(new ae('w:overflowPunct', e.overflowPunctuation)))
      let i = [
        ...(e.rightTabStop !== void 0 ? [{ type: $h.RIGHT, position: e.rightTabStop }] : []),
        ...(e.tabStops ? e.tabStops : []),
        ...(e.leftTabStop !== void 0 ? [{ type: $h.LEFT, position: e.leftTabStop }] : []),
      ]
      ;(i.length > 0 && this.push(new Po(i)),
        e.bidirectional !== void 0 && this.push(new ae('w:bidi', e.bidirectional)),
        e.spacing && this.push(new Bo(e.spacing)),
        e.indent && this.push(new ws(e.indent)),
        e.contextualSpacing !== void 0 &&
          this.push(new ae('w:contextualSpacing', e.contextualSpacing)),
        e.alignment && this.push(new sn(e.alignment)),
        e.outlineLevel !== void 0 && this.push(new Yo(e.outlineLevel)),
        e.suppressLineNumbers !== void 0 &&
          this.push(new ae('w:suppressLineNumbers', e.suppressLineNumbers)),
        e.autoSpaceEastAsianText !== void 0 &&
          this.push(new ae('w:autoSpaceDN', e.autoSpaceEastAsianText)),
        e.run && this.push(new pt(e.run)))
    }
    push(e) {
      this.root.push(e)
    }
    prepForXml(e) {
      if (e.viewWrapper instanceof vn)
        for (let r of this.numberingReferences)
          e.file.Numbering.createConcreteNumberingInstance(r.reference, r.instance)
      return super.prepForXml(e)
    }
  },
  Nt = class extends Ur {
    constructor(e) {
      if ((super('w:p'), $(this, 'properties'), typeof e == 'string'))
        return (
          (this.properties = new Ft({})),
          this.root.push(this.properties),
          this.root.push(new ar(e)),
          this
        )
      if (
        ((this.properties = new Ft(e)),
        this.root.push(this.properties),
        e.text && this.root.push(new ar(e.text)),
        e.children)
      )
        for (let r of e.children) {
          if (r instanceof Vo) {
            this.root.push(r.start)
            for (let n of r.children) this.root.push(n)
            this.root.push(r.end)
            continue
          }
          this.root.push(r)
        }
    }
    prepForXml(e) {
      for (let r of this.root)
        if (r instanceof wn) {
          let n = this.root.indexOf(r),
            i = new zt(r.options.children, Xc())
          ;(e.viewWrapper.Relationships.createRelationship(
            i.linkId,
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
            r.options.link,
            $d.EXTERNAL,
          ),
            (this.root[n] = i))
        }
      return super.prepForXml(e)
    }
    addRunToFront(e) {
      return (this.root.splice(1, 0, e), this)
    }
  },
  fy = class extends M {
    constructor(e) {
      super('m:oMath')
      for (let r of e.children) this.root.push(r)
    }
  },
  _a = class extends M {
    constructor(e) {
      ;(super('m:t'), this.root.push(e))
    }
  },
  Zh = class extends M {
    constructor(e) {
      ;(super('m:r'), this.root.push(new _a(e)))
    }
  },
  ba = class extends M {
    constructor(e) {
      super('m:den')
      for (let r of e) this.root.push(r)
    }
  },
  Ea = class extends M {
    constructor(e) {
      super('m:num')
      for (let r of e) this.root.push(r)
    }
  },
  Jh = class extends M {
    constructor(e) {
      ;(super('m:f'), this.root.push(new Ea(e.numerator)), this.root.push(new ba(e.denominator)))
    }
  },
  xa = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { accent: 'm:val' }))
    }
  },
  Ta = class extends M {
    constructor(e) {
      ;(super('m:chr'), this.root.push(new xa({ accent: e })))
    }
  },
  Be = class extends M {
    constructor(e) {
      super('m:e')
      for (let r of e) this.root.push(r)
    }
  },
  Aa = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { value: 'm:val' }))
    }
  },
  Sa = class extends M {
    constructor(e) {
      ;(super('m:limLoc'), this.root.push(new Aa({ value: e || 'undOvr' })))
    }
  },
  Ia = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { hide: 'm:val' }))
    }
  },
  Ra = class extends M {
    constructor() {
      ;(super('m:subHide'), this.root.push(new Ia({ hide: 1 })))
    }
  },
  Na = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { hide: 'm:val' }))
    }
  },
  ka = class extends M {
    constructor() {
      ;(super('m:supHide'), this.root.push(new Na({ hide: 1 })))
    }
  },
  _n = class extends M {
    constructor(e, r, n, i) {
      ;(super('m:naryPr'),
        e && this.root.push(new Ta(e)),
        this.root.push(new Sa(i)),
        r || this.root.push(new ka()),
        n || this.root.push(new Ra()))
    }
  },
  Gt = class extends M {
    constructor(e) {
      super('m:sub')
      for (let r of e) this.root.push(r)
    }
  },
  Kt = class extends M {
    constructor(e) {
      super('m:sup')
      for (let r of e) this.root.push(r)
    }
  },
  Qh = class extends M {
    constructor(e) {
      ;(super('m:nary'),
        this.root.push(new _n('\u2211', !!e.superScript, !!e.subScript)),
        e.subScript && this.root.push(new Gt(e.subScript)),
        e.superScript && this.root.push(new Kt(e.superScript)),
        this.root.push(new Be(e.children)))
    }
  },
  ef = class extends M {
    constructor(e) {
      ;(super('m:nary'),
        this.root.push(new _n('', !!e.superScript, !!e.subScript, 'subSup')),
        e.subScript && this.root.push(new Gt(e.subScript)),
        e.superScript && this.root.push(new Kt(e.superScript)),
        this.root.push(new Be(e.children)))
    }
  },
  bn = class extends M {
    constructor(e) {
      super('m:lim')
      for (let r of e) this.root.push(r)
    }
  },
  tf = class extends M {
    constructor(e) {
      ;(super('m:limUpp'), this.root.push(new Be(e.children)), this.root.push(new bn(e.limit)))
    }
  },
  rf = class extends M {
    constructor(e) {
      ;(super('m:limLow'), this.root.push(new Be(e.children)), this.root.push(new bn(e.limit)))
    }
  },
  Ca = class extends M {
    constructor() {
      super('m:sSupPr')
    }
  },
  nf = class extends M {
    constructor(e) {
      ;(super('m:sSup'),
        this.root.push(new Ca()),
        this.root.push(new Be(e.children)),
        this.root.push(new Kt(e.superScript)))
    }
  },
  Oa = class extends M {
    constructor() {
      super('m:sSubPr')
    }
  },
  sf = class extends M {
    constructor(e) {
      ;(super('m:sSub'),
        this.root.push(new Oa()),
        this.root.push(new Be(e.children)),
        this.root.push(new Gt(e.subScript)))
    }
  },
  Da = class extends M {
    constructor() {
      super('m:sSubSupPr')
    }
  },
  of = class extends M {
    constructor(e) {
      ;(super('m:sSubSup'),
        this.root.push(new Da()),
        this.root.push(new Be(e.children)),
        this.root.push(new Gt(e.subScript)),
        this.root.push(new Kt(e.superScript)))
    }
  },
  Fa = class extends M {
    constructor() {
      super('m:sPrePr')
    }
  },
  af = class extends M {
    constructor(e) {
      ;(super('m:sPre'),
        this.root.push(new Fa()),
        this.root.push(new Be(e.children)),
        this.root.push(new Gt(e.subScript)),
        this.root.push(new Kt(e.superScript)))
    }
  },
  py = '',
  La = class extends M {
    constructor(e) {
      if ((super('m:deg'), e)) for (let r of e) this.root.push(r)
    }
  },
  Ba = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { hide: 'm:val' }))
    }
  },
  Pa = class extends M {
    constructor() {
      ;(super('m:degHide'), this.root.push(new Ba({ hide: 1 })))
    }
  },
  Ua = class extends M {
    constructor(e) {
      ;(super('m:radPr'), e || this.root.push(new Pa()))
    }
  },
  uf = class extends M {
    constructor(e) {
      ;(super('m:rad'),
        this.root.push(new Ua(!!e.degree)),
        this.root.push(new La(e.degree)),
        this.root.push(new Be(e.children)))
    }
  },
  Ma = class extends M {
    constructor(e) {
      super('m:fName')
      for (let r of e) this.root.push(r)
    }
  },
  Ha = class extends M {
    constructor() {
      super('m:funcPr')
    }
  },
  cf = class extends M {
    constructor(e) {
      ;(super('m:func'),
        this.root.push(new Ha()),
        this.root.push(new Ma(e.name)),
        this.root.push(new Be(e.children)))
    }
  },
  Wa = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { character: 'm:val' }))
    }
  },
  za = class extends M {
    constructor(e) {
      ;(super('m:begChr'), this.root.push(new Wa({ character: e })))
    }
  },
  ja = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { character: 'm:val' }))
    }
  },
  Ga = class extends M {
    constructor(e) {
      ;(super('m:endChr'), this.root.push(new ja({ character: e })))
    }
  },
  hr = class extends M {
    constructor(e) {
      ;(super('m:dPr'),
        e &&
          (this.root.push(new za(e.beginningCharacter)), this.root.push(new Ga(e.endingCharacter))))
    }
  },
  lf = class extends M {
    constructor(e) {
      ;(super('m:d'), this.root.push(new hr()), this.root.push(new Be(e.children)))
    }
  },
  hf = class extends M {
    constructor(e) {
      ;(super('m:d'),
        this.root.push(new hr({ beginningCharacter: '[', endingCharacter: ']' })),
        this.root.push(new Be(e.children)))
    }
  },
  ff = class extends M {
    constructor(e) {
      ;(super('m:d'),
        this.root.push(new hr({ beginningCharacter: '{', endingCharacter: '}' })),
        this.root.push(new Be(e.children)))
    }
  },
  df = class extends M {
    constructor(e) {
      ;(super('m:d'),
        this.root.push(new hr({ beginningCharacter: '\u2329', endingCharacter: '\u232A' })),
        this.root.push(new Be(e.children)))
    }
  },
  Ka = class extends M {
    constructor(e) {
      super('w:tblGrid')
      for (let r of e) this.root.push(new $a(r))
    }
  },
  $a = class extends M {
    constructor(e) {
      ;(super('w:gridCol'),
        e !== void 0 && this.root.push(new Ge({ width: { key: 'w:w', value: ke(e) } })))
    }
  },
  qd = { TABLE: 'w:tblCellMar', TABLE_CELL: 'w:tcMar' },
  En = class extends et {
    constructor(e, { marginUnitType: r = Va.DXA, top: n, left: i, bottom: s, right: a }) {
      ;(super(e),
        n !== void 0 && this.root.push(new St('w:top', { type: r, size: n })),
        i !== void 0 && this.root.push(new St('w:left', { type: r, size: i })),
        s !== void 0 && this.root.push(new St('w:bottom', { type: r, size: s })),
        a !== void 0 && this.root.push(new St('w:right', { type: r, size: a })))
    }
  },
  Va = { AUTO: 'auto', DXA: 'dxa', NIL: 'nil', PERCENTAGE: 'pct' },
  St = class extends M {
    constructor(e, { type: r = Va.AUTO, size: n }) {
      super(e)
      let i = n
      ;(r === Va.PERCENTAGE && typeof n == 'number' && (i = `${n}%`),
        this.root.push(
          new Ge({ type: { key: 'w:type', value: r }, size: { key: 'w:w', value: Xm(i) } }),
        ))
    }
  },
  qa = class extends et {
    constructor(e) {
      ;(super('w:tcBorders'),
        e.top && this.root.push(new xe('w:top', e.top)),
        e.start && this.root.push(new xe('w:start', e.start)),
        e.left && this.root.push(new xe('w:left', e.left)),
        e.bottom && this.root.push(new xe('w:bottom', e.bottom)),
        e.end && this.root.push(new xe('w:end', e.end)),
        e.right && this.root.push(new xe('w:right', e.right)))
    }
  },
  Xa = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val' }))
    }
  },
  Ya = class extends M {
    constructor(e) {
      ;(super('w:gridSpan'), this.root.push(new Xa({ val: De(e) })))
    }
  },
  Xd = { CONTINUE: 'continue', RESTART: 'restart' },
  Za = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val' }))
    }
  },
  xn = class extends M {
    constructor(e) {
      ;(super('w:vMerge'), this.root.push(new Za({ val: e })))
    }
  },
  my = {
    BOTTOM_TO_TOP_LEFT_TO_RIGHT: 'btLr',
    LEFT_TO_RIGHT_TOP_TO_BOTTOM: 'lrTb',
    TOP_TO_BOTTOM_RIGHT_TO_LEFT: 'tbRl',
  },
  Ja = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val' }))
    }
  },
  Qa = class extends M {
    constructor(e) {
      ;(super('w:textDirection'), this.root.push(new Ja({ val: e })))
    }
  },
  eu = class extends et {
    constructor(e) {
      ;(super('w:tcPr'),
        e.width && this.root.push(new St('w:tcW', e.width)),
        e.columnSpan && this.root.push(new Ya(e.columnSpan)),
        e.verticalMerge
          ? this.root.push(new xn(e.verticalMerge))
          : e.rowSpan && e.rowSpan > 1 && this.root.push(new xn(Xd.RESTART)),
        e.borders && this.root.push(new qa(e.borders)),
        e.shading && this.root.push(new sr(e.shading)),
        e.margins && this.root.push(new En(qd.TABLE_CELL, e.margins)),
        e.textDirection && this.root.push(new Qa(e.textDirection)),
        e.verticalAlign && this.root.push(new gn(e.verticalAlign)))
    }
  },
  Tn = class extends M {
    constructor(e) {
      ;(super('w:tc'), (this.options = e), this.root.push(new eu(e)))
      for (let r of e.children) this.root.push(r)
    }
    prepForXml(e) {
      return (
        this.root[this.root.length - 1] instanceof Nt || this.root.push(new Nt({})),
        super.prepForXml(e)
      )
    }
  },
  qt = { style: Vc.NONE, size: 0, color: 'auto' },
  Xt = { style: Vc.SINGLE, size: 4, color: 'auto' },
  An = class extends M {
    constructor(e) {
      ;(super('w:tblBorders'),
        e.top ? this.root.push(new xe('w:top', e.top)) : this.root.push(new xe('w:top', Xt)),
        e.left ? this.root.push(new xe('w:left', e.left)) : this.root.push(new xe('w:left', Xt)),
        e.bottom
          ? this.root.push(new xe('w:bottom', e.bottom))
          : this.root.push(new xe('w:bottom', Xt)),
        e.right
          ? this.root.push(new xe('w:right', e.right))
          : this.root.push(new xe('w:right', Xt)),
        e.insideHorizontal
          ? this.root.push(new xe('w:insideH', e.insideHorizontal))
          : this.root.push(new xe('w:insideH', Xt)),
        e.insideVertical
          ? this.root.push(new xe('w:insideV', e.insideVertical))
          : this.root.push(new xe('w:insideV', Xt)))
    }
  }
$(An, 'NONE', {
  top: qt,
  bottom: qt,
  left: qt,
  right: qt,
  insideHorizontal: qt,
  insideVertical: qt,
})
var wy = { MARGIN: 'margin', PAGE: 'page', TEXT: 'text' },
  gy = { CENTER: 'center', INSIDE: 'inside', LEFT: 'left', OUTSIDE: 'outside', RIGHT: 'right' },
  yy = {
    CENTER: 'center',
    INSIDE: 'inside',
    BOTTOM: 'bottom',
    OUTSIDE: 'outside',
    INLINE: 'inline',
    TOP: 'top',
  },
  vy = { NEVER: 'never', OVERLAP: 'overlap' },
  tu = class extends M {
    constructor({
      horizontalAnchor: e,
      verticalAnchor: r,
      absoluteHorizontalPosition: n,
      relativeHorizontalPosition: i,
      absoluteVerticalPosition: s,
      relativeVerticalPosition: a,
      bottomFromText: o,
      topFromText: l,
      leftFromText: p,
      rightFromText: g,
      overlap: v,
    }) {
      ;(super('w:tblpPr'),
        this.root.push(
          new Ge({
            leftFromText: { key: 'w:leftFromText', value: p === void 0 ? void 0 : ke(p) },
            rightFromText: { key: 'w:rightFromText', value: g === void 0 ? void 0 : ke(g) },
            topFromText: { key: 'w:topFromText', value: l === void 0 ? void 0 : ke(l) },
            bottomFromText: { key: 'w:bottomFromText', value: o === void 0 ? void 0 : ke(o) },
            absoluteHorizontalPosition: { key: 'w:tblpX', value: n === void 0 ? void 0 : At(n) },
            absoluteVerticalPosition: { key: 'w:tblpY', value: s === void 0 ? void 0 : At(s) },
            horizontalAnchor: { key: 'w:horzAnchor', value: e === void 0 ? void 0 : e },
            relativeHorizontalPosition: { key: 'w:tblpXSpec', value: i },
            relativeVerticalPosition: { key: 'w:tblpYSpec', value: a },
            verticalAnchor: { key: 'w:vertAnchor', value: r },
          }),
        ),
        v && this.root.push(new hs('w:tblOverlap', v)))
    }
  },
  _y = { AUTOFIT: 'autofit', FIXED: 'fixed' },
  ru = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { type: 'w:type' }))
    }
  },
  nu = class extends M {
    constructor(e) {
      ;(super('w:tblLayout'), this.root.push(new ru({ type: e })))
    }
  },
  iu = class extends et {
    constructor(e) {
      ;(super('w:tblPr'),
        e.style && this.root.push(new lt('w:tblStyle', e.style)),
        e.float && this.root.push(new tu(e.float)),
        e.visuallyRightToLeft !== void 0 &&
          this.root.push(new ae('w:bidiVisual', e.visuallyRightToLeft)),
        e.width && this.root.push(new St('w:tblW', e.width)),
        e.alignment && this.root.push(new sn(e.alignment)),
        e.indent && this.root.push(new St('w:tblInd', e.indent)),
        e.borders && this.root.push(new An(e.borders)),
        e.shading && this.root.push(new sr(e.shading)),
        e.layout && this.root.push(new nu(e.layout)),
        e.cellMargin && this.root.push(new En(qd.TABLE, e.cellMargin)))
    }
  },
  pf = class extends Ur {
    constructor({
      rows: e,
      width: r,
      columnWidths: n = Array(Math.max(...e.map((E) => E.CellCount))).fill(100),
      margins: i,
      indent: s,
      float: a,
      layout: o,
      style: l,
      borders: p,
      alignment: g,
      visuallyRightToLeft: v,
    }) {
      ;(super('w:tbl'),
        this.root.push(
          new iu({
            borders: p ?? {},
            width: r ?? { size: 100 },
            indent: s,
            float: a,
            layout: o,
            style: l,
            alignment: g,
            cellMargin: i,
            visuallyRightToLeft: v,
          }),
        ),
        this.root.push(new Ka(n)))
      for (let E of e) this.root.push(E)
      e.forEach((E, d) => {
        if (d === e.length - 1) return
        let x = 0
        E.cells.forEach((b) => {
          if (b.options.rowSpan && b.options.rowSpan > 1) {
            let T = new Tn({
              rowSpan: b.options.rowSpan - 1,
              columnSpan: b.options.columnSpan,
              borders: b.options.borders,
              children: [],
              verticalMerge: Xd.CONTINUE,
            })
            e[d + 1].addCellToColumnIndex(T, x)
          }
          x += b.options.columnSpan || 1
        })
      })
    }
  },
  by = { AUTO: 'auto', ATLEAST: 'atLeast', EXACT: 'exact' },
  su = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { value: 'w:val', rule: 'w:hRule' }))
    }
  },
  ou = class extends M {
    constructor(e, r) {
      ;(super('w:trHeight'), this.root.push(new su({ value: ke(e), rule: r })))
    }
  },
  au = class extends et {
    constructor(e) {
      ;(super('w:trPr'),
        e.cantSplit !== void 0 && this.root.push(new ae('w:cantSplit', e.cantSplit)),
        e.tableHeader !== void 0 && this.root.push(new ae('w:tblHeader', e.tableHeader)),
        e.height && this.root.push(new ou(e.height.value, e.height.rule)))
    }
  },
  mf = class extends M {
    constructor(e) {
      ;(super('w:tr'), (this.options = e), this.root.push(new au(e)))
      for (let r of e.children) this.root.push(r)
    }
    get CellCount() {
      return this.options.children.length
    }
    get cells() {
      return this.root.filter((e) => e instanceof Tn)
    }
    addCellToIndex(e, r) {
      this.root.splice(r + 1, 0, e)
    }
    addCellToColumnIndex(e, r) {
      let n = this.columnIndexToRootIndex(r, !0)
      this.addCellToIndex(e, n - 1)
    }
    rootIndexToColumnIndex(e) {
      if (e < 1 || e >= this.root.length)
        throw new Error(`cell 'rootIndex' should between 1 to ${this.root.length - 1}`)
      let r = 0
      for (let n = 1; n < e; n++) {
        let i = this.root[n]
        r += i.options.columnSpan || 1
      }
      return r
    }
    columnIndexToRootIndex(e, r = !1) {
      if (e < 0) throw new Error("cell 'columnIndex' should not less than zero")
      let n = 0,
        i = 1
      for (; n <= e; ) {
        if (i >= this.root.length) {
          if (r) return this.root.length
          throw new Error(`cell 'columnIndex' should not great than ${n - 1}`)
        }
        let s = this.root[i]
        ;((i += 1), (n += (s && s.options.columnSpan) || 1))
      }
      return i - 1
    }
  },
  uu = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { xmlns: 'xmlns', vt: 'xmlns:vt' }))
    }
  },
  cu = class extends M {
    constructor() {
      ;(super('Properties'),
        this.root.push(
          new uu({
            xmlns: 'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
            vt: 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
          }),
        ))
    }
  },
  lu = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { xmlns: 'xmlns' }))
    }
  },
  hu = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { contentType: 'ContentType', extension: 'Extension' }))
    }
  },
  Je = class extends M {
    constructor(e, r) {
      ;(super('Default'), this.root.push(new hu({ contentType: e, extension: r })))
    }
  },
  fu = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', { contentType: 'ContentType', partName: 'PartName' }))
    }
  },
  ze = class extends M {
    constructor(e, r) {
      ;(super('Override'), this.root.push(new fu({ contentType: e, partName: r })))
    }
  },
  du = class extends M {
    constructor() {
      ;(super('Types'),
        this.root.push(
          new lu({ xmlns: 'http://schemas.openxmlformats.org/package/2006/content-types' }),
        ),
        this.root.push(new Je('image/png', 'png')),
        this.root.push(new Je('image/jpeg', 'jpeg')),
        this.root.push(new Je('image/jpeg', 'jpg')),
        this.root.push(new Je('image/bmp', 'bmp')),
        this.root.push(new Je('image/gif', 'gif')),
        this.root.push(new Je('image/svg+xml', 'svg')),
        this.root.push(new Je('application/vnd.openxmlformats-package.relationships+xml', 'rels')),
        this.root.push(new Je('application/xml', 'xml')),
        this.root.push(
          new Je('application/vnd.openxmlformats-officedocument.obfuscatedFont', 'odttf'),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml',
            '/word/document.xml',
          ),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml',
            '/word/styles.xml',
          ),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-package.core-properties+xml',
            '/docProps/core.xml',
          ),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-officedocument.custom-properties+xml',
            '/docProps/custom.xml',
          ),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-officedocument.extended-properties+xml',
            '/docProps/app.xml',
          ),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml',
            '/word/numbering.xml',
          ),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml',
            '/word/footnotes.xml',
          ),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml',
            '/word/settings.xml',
          ),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml',
            '/word/comments.xml',
          ),
        ),
        this.root.push(
          new ze(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml',
            '/word/fontTable.xml',
          ),
        ))
    }
    addFooter(e) {
      this.root.push(
        new ze(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml',
          `/word/footer${e}.xml`,
        ),
      )
    }
    addHeader(e) {
      this.root.push(
        new ze(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml',
          `/word/header${e}.xml`,
        ),
      )
    }
  },
  pu = class extends M {
    constructor(e) {
      ;(super('cp:coreProperties'),
        this.root.push(
          new jt({
            cp: 'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
            dc: 'http://purl.org/dc/elements/1.1/',
            dcterms: 'http://purl.org/dc/terms/',
            dcmitype: 'http://purl.org/dc/dcmitype/',
            xsi: 'http://www.w3.org/2001/XMLSchema-instance',
          }),
        ),
        e.title && this.root.push(new xt('dc:title', e.title)),
        e.subject && this.root.push(new xt('dc:subject', e.subject)),
        e.creator && this.root.push(new xt('dc:creator', e.creator)),
        e.keywords && this.root.push(new xt('cp:keywords', e.keywords)),
        e.description && this.root.push(new xt('dc:description', e.description)),
        e.lastModifiedBy && this.root.push(new xt('cp:lastModifiedBy', e.lastModifiedBy)),
        e.revision && this.root.push(new xt('cp:revision', String(e.revision))),
        this.root.push(new Sn('dcterms:created')),
        this.root.push(new Sn('dcterms:modified')))
    }
  },
  Sn = class extends M {
    constructor(e) {
      ;(super(e),
        this.root.push(new jt({ type: 'dcterms:W3CDTF' })),
        this.root.push(Jm(new Date())))
    }
  },
  mu = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { xmlns: 'xmlns', vt: 'xmlns:vt' }))
    }
  },
  wu = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { fmtid: 'fmtid', pid: 'pid', name: 'name' }))
    }
  },
  gu = class extends M {
    constructor(e, r) {
      ;(super('property'),
        this.root.push(
          new wu({
            fmtid: '{D5CDD505-2E9C-101B-9397-08002B2CF9AE}',
            pid: e.toString(),
            name: r.name,
          }),
        ),
        this.root.push(new yu(r.value)))
    }
  },
  yu = class extends M {
    constructor(e) {
      ;(super('vt:lpwstr'), this.root.push(e))
    }
  },
  vu = class extends M {
    constructor(e) {
      ;(super('Properties'),
        $(this, 'nextId'),
        $(this, 'properties', []),
        this.root.push(
          new mu({
            xmlns: 'http://schemas.openxmlformats.org/officeDocument/2006/custom-properties',
            vt: 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
          }),
        ),
        (this.nextId = 2))
      for (let r of e) this.addCustomProperty(r)
    }
    prepForXml(e) {
      return (this.properties.forEach((r) => this.root.push(r)), super.prepForXml(e))
    }
    addCustomProperty(e) {
      this.properties.push(new gu(this.nextId++, e))
    }
  },
  _u = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          wpc: 'xmlns:wpc',
          mc: 'xmlns:mc',
          o: 'xmlns:o',
          r: 'xmlns:r',
          m: 'xmlns:m',
          v: 'xmlns:v',
          wp14: 'xmlns:wp14',
          wp: 'xmlns:wp',
          w10: 'xmlns:w10',
          w: 'xmlns:w',
          w14: 'xmlns:w14',
          w15: 'xmlns:w15',
          wpg: 'xmlns:wpg',
          wpi: 'xmlns:wpi',
          wne: 'xmlns:wne',
          wps: 'xmlns:wps',
          cp: 'xmlns:cp',
          dc: 'xmlns:dc',
          dcterms: 'xmlns:dcterms',
          dcmitype: 'xmlns:dcmitype',
          xsi: 'xmlns:xsi',
          type: 'xsi:type',
        }))
    }
  },
  Y0 = class extends nn {
    constructor(e, r) {
      ;(super('w:ftr', r),
        $(this, 'refId'),
        (this.refId = e),
        r ||
          this.root.push(
            new _u({
              wpc: 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
              mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
              o: 'urn:schemas-microsoft-com:office:office',
              r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
              m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
              v: 'urn:schemas-microsoft-com:vml',
              wp14: 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
              wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
              w10: 'urn:schemas-microsoft-com:office:word',
              w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
              w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
              w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
              wpg: 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
              wpi: 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
              wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
              wps: 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
            }),
          ))
    }
    get ReferenceId() {
      return this.refId
    }
    add(e) {
      this.root.push(e)
    }
  },
  bu = class {
    constructor(e, r, n) {
      ;($(this, 'footer'),
        $(this, 'relationships'),
        (this.media = e),
        (this.footer = new Y0(r, n)),
        (this.relationships = new Dt()))
    }
    add(e) {
      this.footer.add(e)
    }
    addChildElement(e) {
      this.footer.addChildElement(e)
    }
    get View() {
      return this.footer
    }
    get Relationships() {
      return this.relationships
    }
    get Media() {
      return this.media
    }
  },
  Eu = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { type: 'w:type', id: 'w:id' }))
    }
  },
  xu = class extends M {
    constructor() {
      super('w:footnoteRef')
    }
  },
  Tu = class extends He {
    constructor() {
      ;(super({ style: 'FootnoteReference' }), this.root.push(new xu()))
    }
  },
  wf = { SEPERATOR: 'separator', CONTINUATION_SEPERATOR: 'continuationSeparator' },
  Or = class extends M {
    constructor(e) {
      ;(super('w:footnote'), this.root.push(new Eu({ type: e.type, id: e.id })))
      for (let r = 0; r < e.children.length; r++) {
        let n = e.children[r]
        ;(r === 0 && n.addRunToFront(new Tu()), this.root.push(n))
      }
    }
  },
  Au = class extends M {
    constructor() {
      super('w:continuationSeparator')
    }
  },
  Su = class extends He {
    constructor() {
      ;(super({}), this.root.push(new Au()))
    }
  },
  Iu = class extends M {
    constructor() {
      super('w:separator')
    }
  },
  Ru = class extends He {
    constructor() {
      ;(super({}), this.root.push(new Iu()))
    }
  },
  Nu = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          wpc: 'xmlns:wpc',
          mc: 'xmlns:mc',
          o: 'xmlns:o',
          r: 'xmlns:r',
          m: 'xmlns:m',
          v: 'xmlns:v',
          wp14: 'xmlns:wp14',
          wp: 'xmlns:wp',
          w10: 'xmlns:w10',
          w: 'xmlns:w',
          w14: 'xmlns:w14',
          w15: 'xmlns:w15',
          wpg: 'xmlns:wpg',
          wpi: 'xmlns:wpi',
          wne: 'xmlns:wne',
          wps: 'xmlns:wps',
          Ignorable: 'mc:Ignorable',
        }))
    }
  },
  ku = class extends M {
    constructor() {
      ;(super('w:footnotes'),
        this.root.push(
          new Nu({
            wpc: 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
            mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
            o: 'urn:schemas-microsoft-com:office:office',
            r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
            m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
            v: 'urn:schemas-microsoft-com:vml',
            wp14: 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
            wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
            w10: 'urn:schemas-microsoft-com:office:word',
            w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
            w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
            w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
            wpg: 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
            wpi: 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
            wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
            wps: 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
            Ignorable: 'w14 w15 wp14',
          }),
        ))
      let e = new Or({
        id: -1,
        type: wf.SEPERATOR,
        children: [
          new Nt({ spacing: { after: 0, line: 240, lineRule: Fo.AUTO }, children: [new Ru()] }),
        ],
      })
      this.root.push(e)
      let r = new Or({
        id: 0,
        type: wf.CONTINUATION_SEPERATOR,
        children: [
          new Nt({ spacing: { after: 0, line: 240, lineRule: Fo.AUTO }, children: [new Su()] }),
        ],
      })
      this.root.push(r)
    }
    createFootNote(e, r) {
      let n = new Or({ id: e, children: r })
      this.root.push(n)
    }
  },
  Cu = class {
    constructor() {
      ;($(this, 'footnotess'),
        $(this, 'relationships'),
        (this.footnotess = new ku()),
        (this.relationships = new Dt()))
    }
    get View() {
      return this.footnotess
    }
    get Relationships() {
      return this.relationships
    }
  },
  Ou = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          wpc: 'xmlns:wpc',
          mc: 'xmlns:mc',
          o: 'xmlns:o',
          r: 'xmlns:r',
          m: 'xmlns:m',
          v: 'xmlns:v',
          wp14: 'xmlns:wp14',
          wp: 'xmlns:wp',
          w10: 'xmlns:w10',
          w: 'xmlns:w',
          w14: 'xmlns:w14',
          w15: 'xmlns:w15',
          wpg: 'xmlns:wpg',
          wpi: 'xmlns:wpi',
          wne: 'xmlns:wne',
          wps: 'xmlns:wps',
          cp: 'xmlns:cp',
          dc: 'xmlns:dc',
          dcterms: 'xmlns:dcterms',
          dcmitype: 'xmlns:dcmitype',
          xsi: 'xmlns:xsi',
          type: 'xsi:type',
          cx: 'xmlns:cx',
          cx1: 'xmlns:cx1',
          cx2: 'xmlns:cx2',
          cx3: 'xmlns:cx3',
          cx4: 'xmlns:cx4',
          cx5: 'xmlns:cx5',
          cx6: 'xmlns:cx6',
          cx7: 'xmlns:cx7',
          cx8: 'xmlns:cx8',
          w16cid: 'xmlns:w16cid',
          w16se: 'xmlns:w16se',
        }))
    }
  },
  Z0 = class extends nn {
    constructor(e, r) {
      ;(super('w:hdr', r),
        $(this, 'refId'),
        (this.refId = e),
        r ||
          this.root.push(
            new Ou({
              wpc: 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
              mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
              o: 'urn:schemas-microsoft-com:office:office',
              r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
              m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
              v: 'urn:schemas-microsoft-com:vml',
              wp14: 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
              wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
              w10: 'urn:schemas-microsoft-com:office:word',
              w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
              w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
              w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
              wpg: 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
              wpi: 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
              wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
              wps: 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
              cx: 'http://schemas.microsoft.com/office/drawing/2014/chartex',
              cx1: 'http://schemas.microsoft.com/office/drawing/2015/9/8/chartex',
              cx2: 'http://schemas.microsoft.com/office/drawing/2015/10/21/chartex',
              cx3: 'http://schemas.microsoft.com/office/drawing/2016/5/9/chartex',
              cx4: 'http://schemas.microsoft.com/office/drawing/2016/5/10/chartex',
              cx5: 'http://schemas.microsoft.com/office/drawing/2016/5/11/chartex',
              cx6: 'http://schemas.microsoft.com/office/drawing/2016/5/12/chartex',
              cx7: 'http://schemas.microsoft.com/office/drawing/2016/5/13/chartex',
              cx8: 'http://schemas.microsoft.com/office/drawing/2016/5/14/chartex',
              w16cid: 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
              w16se: 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
            }),
          ))
    }
    get ReferenceId() {
      return this.refId
    }
    add(e) {
      this.root.push(e)
    }
  },
  Du = class {
    constructor(e, r, n) {
      ;($(this, 'header'),
        $(this, 'relationships'),
        (this.media = e),
        (this.header = new Z0(r, n)),
        (this.relationships = new Dt()))
    }
    add(e) {
      return (this.header.add(e), this)
    }
    addChildElement(e) {
      this.header.addChildElement(e)
    }
    get View() {
      return this.header
    }
    get Relationships() {
      return this.relationships
    }
    get Media() {
      return this.media
    }
  },
  In = class {
    constructor() {
      ;($(this, 'map'), (this.map = new Map()))
    }
    addImage(e, r) {
      this.map.set(e, r)
    }
    get Array() {
      return Array.from(this.map.values())
    }
  },
  Ty = '',
  Et = {
    DECIMAL: 'decimal',
    UPPER_ROMAN: 'upperRoman',
    LOWER_ROMAN: 'lowerRoman',
    UPPER_LETTER: 'upperLetter',
    LOWER_LETTER: 'lowerLetter',
    ORDINAL: 'ordinal',
    CARDINAL_TEXT: 'cardinalText',
    ORDINAL_TEXT: 'ordinalText',
    HEX: 'hex',
    CHICAGO: 'chicago',
    IDEOGRAPH__DIGITAL: 'ideographDigital',
    JAPANESE_COUNTING: 'japaneseCounting',
    AIUEO: 'aiueo',
    IROHA: 'iroha',
    DECIMAL_FULL_WIDTH: 'decimalFullWidth',
    DECIMAL_HALF_WIDTH: 'decimalHalfWidth',
    JAPANESE_LEGAL: 'japaneseLegal',
    JAPANESE_DIGITAL_TEN_THOUSAND: 'japaneseDigitalTenThousand',
    DECIMAL_ENCLOSED_CIRCLE: 'decimalEnclosedCircle',
    DECIMAL_FULL_WIDTH2: 'decimalFullWidth2',
    AIUEO_FULL_WIDTH: 'aiueoFullWidth',
    IROHA_FULL_WIDTH: 'irohaFullWidth',
    DECIMAL_ZERO: 'decimalZero',
    BULLET: 'bullet',
    GANADA: 'ganada',
    CHOSUNG: 'chosung',
    DECIMAL_ENCLOSED_FULLSTOP: 'decimalEnclosedFullstop',
    DECIMAL_ENCLOSED_PARENTHESES: 'decimalEnclosedParen',
    DECIMAL_ENCLOSED_CIRCLE_CHINESE: 'decimalEnclosedCircleChinese',
    IDEOGRAPH_ENCLOSED_CIRCLE: 'ideographEnclosedCircle',
    IDEOGRAPH_TRADITIONAL: 'ideographTraditional',
    IDEOGRAPH_ZODIAC: 'ideographZodiac',
    IDEOGRAPH_ZODIAC_TRADITIONAL: 'ideographZodiacTraditional',
    TAIWANESE_COUNTING: 'taiwaneseCounting',
    IDEOGRAPH_LEGAL_TRADITIONAL: 'ideographLegalTraditional',
    TAIWANESE_COUNTING_THOUSAND: 'taiwaneseCountingThousand',
    TAIWANESE_DIGITAL: 'taiwaneseDigital',
    CHINESE_COUNTING: 'chineseCounting',
    CHINESE_LEGAL_SIMPLIFIED: 'chineseLegalSimplified',
    CHINESE_COUNTING_THOUSAND: 'chineseCountingThousand',
    KOREAN_DIGITAL: 'koreanDigital',
    KOREAN_COUNTING: 'koreanCounting',
    KOREAN_LEGAL: 'koreanLegal',
    KOREAN_DIGITAL2: 'koreanDigital2',
    VIETNAMESE_COUNTING: 'vietnameseCounting',
    RUSSIAN_LOWER: 'russianLower',
    RUSSIAN_UPPER: 'russianUpper',
    NONE: 'none',
    NUMBER_IN_DASH: 'numberInDash',
    HEBREW1: 'hebrew1',
    HEBREW2: 'hebrew2',
    ARABIC_ALPHA: 'arabicAlpha',
    ARABIC_ABJAD: 'arabicAbjad',
    HINDI_VOWELS: 'hindiVowels',
    HINDI_CONSONANTS: 'hindiConsonants',
    HINDI_NUMBERS: 'hindiNumbers',
    HINDI_COUNTING: 'hindiCounting',
    THAI_LETTERS: 'thaiLetters',
    THAI_NUMBERS: 'thaiNumbers',
    THAI_COUNTING: 'thaiCounting',
    BAHT_TEXT: 'bahtText',
    DOLLAR_TEXT: 'dollarText',
    CUSTOM: 'custom',
  },
  Fu = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { ilvl: 'w:ilvl', tentative: 'w15:tentative' }))
    }
  },
  Lu = class extends M {
    constructor(e) {
      ;(super('w:numFmt'), this.root.push(new Ae({ val: e })))
    }
  },
  Bu = class extends M {
    constructor(e) {
      ;(super('w:lvlText'), this.root.push(new Ae({ val: e })))
    }
  },
  Pu = class extends M {
    constructor(e) {
      ;(super('w:lvlJc'), this.root.push(new Ae({ val: e })))
    }
  },
  Ay = { NOTHING: 'nothing', SPACE: 'space', TAB: 'tab' },
  Uu = class extends M {
    constructor(e) {
      ;(super('w:suff'), this.root.push(new Ae({ val: e })))
    }
  },
  Mu = class extends M {
    constructor() {
      super('w:isLgl')
    }
  },
  Rn = class extends M {
    constructor({
      level: e,
      format: r,
      text: n,
      alignment: i = st.START,
      start: s = 1,
      style: a,
      suffix: o,
      isLegalNumberingStyle: l,
    }) {
      if (
        (super('w:lvl'),
        $(this, 'paragraphProperties'),
        $(this, 'runProperties'),
        this.root.push(new Fr('w:start', De(s))),
        r && this.root.push(new Lu(r)),
        o && this.root.push(new Uu(o)),
        l && this.root.push(new Mu()),
        n && this.root.push(new Bu(n)),
        this.root.push(new Pu(i)),
        (this.paragraphProperties = new Ft(a && a.paragraph)),
        (this.runProperties = new pt(a && a.run)),
        this.root.push(this.paragraphProperties),
        this.root.push(this.runProperties),
        e > 9)
      )
        throw new Error(
          'Level cannot be greater than 9. Read more here: https://answers.microsoft.com/en-us/msoffice/forum/all/does-word-support-more-than-9-list-levels/d130fdcd-1781-446d-8c84-c6c79124e4d7',
        )
      this.root.push(new Fu({ ilvl: De(e), tentative: 1 }))
    }
  },
  Hu = class extends Rn {},
  gf = class extends Rn {},
  Wu = class extends M {
    constructor(e) {
      ;(super('w:multiLevelType'), this.root.push(new Ae({ val: e })))
    }
  },
  zu = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          abstractNumId: 'w:abstractNumId',
          restartNumberingAfterBreak: 'w15:restartNumberingAfterBreak',
        }))
    }
  },
  Nn = class extends M {
    constructor(e, r) {
      ;(super('w:abstractNum'),
        $(this, 'id'),
        this.root.push(new zu({ abstractNumId: De(e), restartNumberingAfterBreak: 0 })),
        this.root.push(new Wu('hybridMultilevel')),
        (this.id = e))
      for (let n of r) this.root.push(new Hu(n))
    }
  },
  ju = class extends M {
    constructor(e) {
      ;(super('w:abstractNumId'), this.root.push(new Ae({ val: e })))
    }
  },
  Gu = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { numId: 'w:numId' }))
    }
  },
  kn = class extends M {
    constructor(e) {
      if (
        (super('w:num'),
        $(this, 'numId'),
        $(this, 'reference'),
        $(this, 'instance'),
        (this.numId = e.numId),
        (this.reference = e.reference),
        (this.instance = e.instance),
        this.root.push(new Gu({ numId: De(e.numId) })),
        this.root.push(new ju(De(e.abstractNumId))),
        e.overrideLevels && e.overrideLevels.length)
      )
        for (let r of e.overrideLevels) this.root.push(new $u(r.num, r.start))
    }
  },
  Ku = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { ilvl: 'w:ilvl' }))
    }
  },
  $u = class extends M {
    constructor(e, r) {
      ;(super('w:lvlOverride'),
        this.root.push(new Ku({ ilvl: e })),
        r !== void 0 && this.root.push(new qu(r)))
    }
  },
  Vu = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val' }))
    }
  },
  qu = class extends M {
    constructor(e) {
      ;(super('w:startOverride'), this.root.push(new Vu({ val: e })))
    }
  },
  Xu = class extends M {
    constructor(e) {
      ;(super('w:numbering'),
        $(this, 'abstractNumberingMap', new Map()),
        $(this, 'concreteNumberingMap', new Map()),
        $(this, 'referenceConfigMap', new Map()),
        $(this, 'abstractNumUniqueNumericId', k0()),
        $(this, 'concreteNumUniqueNumericId', C0()),
        this.root.push(
          new jt({
            wpc: 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
            mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
            o: 'urn:schemas-microsoft-com:office:office',
            r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
            m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
            v: 'urn:schemas-microsoft-com:vml',
            wp14: 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
            wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
            w10: 'urn:schemas-microsoft-com:office:word',
            w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
            w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
            w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
            wpg: 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
            wpi: 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
            wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
            wps: 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
            Ignorable: 'w14 w15 wp14',
          }),
        ))
      let r = new Nn(this.abstractNumUniqueNumericId(), [
        {
          level: 0,
          format: Et.BULLET,
          text: '\u25CF',
          alignment: st.LEFT,
          style: { paragraph: { indent: { left: Ze(0.5), hanging: Ze(0.25) } } },
        },
        {
          level: 1,
          format: Et.BULLET,
          text: '\u25CB',
          alignment: st.LEFT,
          style: { paragraph: { indent: { left: Ze(1), hanging: Ze(0.25) } } },
        },
        {
          level: 2,
          format: Et.BULLET,
          text: '\u25A0',
          alignment: st.LEFT,
          style: { paragraph: { indent: { left: 2160, hanging: Ze(0.25) } } },
        },
        {
          level: 3,
          format: Et.BULLET,
          text: '\u25CF',
          alignment: st.LEFT,
          style: { paragraph: { indent: { left: 2880, hanging: Ze(0.25) } } },
        },
        {
          level: 4,
          format: Et.BULLET,
          text: '\u25CB',
          alignment: st.LEFT,
          style: { paragraph: { indent: { left: 3600, hanging: Ze(0.25) } } },
        },
        {
          level: 5,
          format: Et.BULLET,
          text: '\u25A0',
          alignment: st.LEFT,
          style: { paragraph: { indent: { left: 4320, hanging: Ze(0.25) } } },
        },
        {
          level: 6,
          format: Et.BULLET,
          text: '\u25CF',
          alignment: st.LEFT,
          style: { paragraph: { indent: { left: 5040, hanging: Ze(0.25) } } },
        },
        {
          level: 7,
          format: Et.BULLET,
          text: '\u25CF',
          alignment: st.LEFT,
          style: { paragraph: { indent: { left: 5760, hanging: Ze(0.25) } } },
        },
        {
          level: 8,
          format: Et.BULLET,
          text: '\u25CF',
          alignment: st.LEFT,
          style: { paragraph: { indent: { left: 6480, hanging: Ze(0.25) } } },
        },
      ])
      ;(this.concreteNumberingMap.set(
        'default-bullet-numbering',
        new kn({
          numId: 1,
          abstractNumId: r.id,
          reference: 'default-bullet-numbering',
          instance: 0,
          overrideLevels: [{ num: 0, start: 1 }],
        }),
      ),
        this.abstractNumberingMap.set('default-bullet-numbering', r))
      for (let n of e.config)
        (this.abstractNumberingMap.set(
          n.reference,
          new Nn(this.abstractNumUniqueNumericId(), n.levels),
        ),
          this.referenceConfigMap.set(n.reference, n.levels))
    }
    prepForXml(e) {
      for (let r of this.abstractNumberingMap.values()) this.root.push(r)
      for (let r of this.concreteNumberingMap.values()) this.root.push(r)
      return super.prepForXml(e)
    }
    createConcreteNumberingInstance(e, r) {
      let n = this.abstractNumberingMap.get(e)
      if (!n) return
      let i = `${e}-${r}`
      if (this.concreteNumberingMap.has(i)) return
      let s = this.referenceConfigMap.get(e),
        a = s && s[0].start,
        o = {
          numId: this.concreteNumUniqueNumericId(),
          abstractNumId: n.id,
          reference: e,
          instance: r,
          overrideLevels: [a && Number.isInteger(a) ? { num: 0, start: a } : { num: 0, start: 1 }],
        }
      this.concreteNumberingMap.set(i, new kn(o))
    }
    get ConcreteNumbering() {
      return Array.from(this.concreteNumberingMap.values())
    }
    get ReferenceConfig() {
      return Array.from(this.referenceConfigMap.values())
    }
  },
  Yu = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { version: 'w:val', name: 'w:name', uri: 'w:uri' }))
    }
  },
  Zu = class extends M {
    constructor(e) {
      ;(super('w:compatSetting'),
        this.root.push(
          new Yu({
            version: e,
            uri: 'http://schemas.microsoft.com/office/word',
            name: 'compatibilityMode',
          }),
        ))
    }
  },
  Ju = class extends M {
    constructor(e) {
      ;(super('w:compat'),
        e.version && this.root.push(new Zu(e.version)),
        e.useSingleBorderforContiguousCells &&
          this.root.push(
            new ae('w:useSingleBorderforContiguousCells', e.useSingleBorderforContiguousCells),
          ),
        e.wordPerfectJustification &&
          this.root.push(new ae('w:wpJustification', e.wordPerfectJustification)),
        e.noTabStopForHangingIndent &&
          this.root.push(new ae('w:noTabHangInd', e.noTabStopForHangingIndent)),
        e.noLeading && this.root.push(new ae('w:noLeading', e.noLeading)),
        e.spaceForUnderline && this.root.push(new ae('w:spaceForUL', e.spaceForUnderline)),
        e.noColumnBalance && this.root.push(new ae('w:noColumnBalance', e.noColumnBalance)),
        e.balanceSingleByteDoubleByteWidth &&
          this.root.push(
            new ae('w:balanceSingleByteDoubleByteWidth', e.balanceSingleByteDoubleByteWidth),
          ),
        e.noExtraLineSpacing &&
          this.root.push(new ae('w:noExtraLineSpacing', e.noExtraLineSpacing)),
        e.doNotLeaveBackslashAlone &&
          this.root.push(new ae('w:doNotLeaveBackslashAlone', e.doNotLeaveBackslashAlone)),
        e.underlineTrailingSpaces &&
          this.root.push(new ae('w:ulTrailSpace', e.underlineTrailingSpaces)),
        e.doNotExpandShiftReturn &&
          this.root.push(new ae('w:doNotExpandShiftReturn', e.doNotExpandShiftReturn)),
        e.spacingInWholePoints &&
          this.root.push(new ae('w:spacingInWholePoints', e.spacingInWholePoints)),
        e.lineWrapLikeWord6 && this.root.push(new ae('w:lineWrapLikeWord6', e.lineWrapLikeWord6)),
        e.printBodyTextBeforeHeader &&
          this.root.push(new ae('w:printBodyTextBeforeHeader', e.printBodyTextBeforeHeader)),
        e.printColorsBlack && this.root.push(new ae('w:printColBlack', e.printColorsBlack)),
        e.spaceWidth && this.root.push(new ae('w:wpSpaceWidth', e.spaceWidth)),
        e.showBreaksInFrames &&
          this.root.push(new ae('w:showBreaksInFrames', e.showBreaksInFrames)),
        e.subFontBySize && this.root.push(new ae('w:subFontBySize', e.subFontBySize)),
        e.suppressBottomSpacing &&
          this.root.push(new ae('w:suppressBottomSpacing', e.suppressBottomSpacing)),
        e.suppressTopSpacing &&
          this.root.push(new ae('w:suppressTopSpacing', e.suppressTopSpacing)),
        e.suppressSpacingAtTopOfPage &&
          this.root.push(new ae('w:suppressSpacingAtTopOfPage', e.suppressSpacingAtTopOfPage)),
        e.suppressTopSpacingWP &&
          this.root.push(new ae('w:suppressTopSpacingWP', e.suppressTopSpacingWP)),
        e.suppressSpBfAfterPgBrk &&
          this.root.push(new ae('w:suppressSpBfAfterPgBrk', e.suppressSpBfAfterPgBrk)),
        e.swapBordersFacingPages &&
          this.root.push(new ae('w:swapBordersFacingPages', e.swapBordersFacingPages)),
        e.convertMailMergeEsc &&
          this.root.push(new ae('w:convMailMergeEsc', e.convertMailMergeEsc)),
        e.truncateFontHeightsLikeWP6 &&
          this.root.push(new ae('w:truncateFontHeightsLikeWP6', e.truncateFontHeightsLikeWP6)),
        e.macWordSmallCaps && this.root.push(new ae('w:mwSmallCaps', e.macWordSmallCaps)),
        e.usePrinterMetrics && this.root.push(new ae('w:usePrinterMetrics', e.usePrinterMetrics)),
        e.doNotSuppressParagraphBorders &&
          this.root.push(
            new ae('w:doNotSuppressParagraphBorders', e.doNotSuppressParagraphBorders),
          ),
        e.wrapTrailSpaces && this.root.push(new ae('w:wrapTrailSpaces', e.wrapTrailSpaces)),
        e.footnoteLayoutLikeWW8 &&
          this.root.push(new ae('w:footnoteLayoutLikeWW8', e.footnoteLayoutLikeWW8)),
        e.shapeLayoutLikeWW8 &&
          this.root.push(new ae('w:shapeLayoutLikeWW8', e.shapeLayoutLikeWW8)),
        e.alignTablesRowByRow &&
          this.root.push(new ae('w:alignTablesRowByRow', e.alignTablesRowByRow)),
        e.forgetLastTabAlignment &&
          this.root.push(new ae('w:forgetLastTabAlignment', e.forgetLastTabAlignment)),
        e.adjustLineHeightInTable &&
          this.root.push(new ae('w:adjustLineHeightInTable', e.adjustLineHeightInTable)),
        e.autoSpaceLikeWord95 &&
          this.root.push(new ae('w:autoSpaceLikeWord95', e.autoSpaceLikeWord95)),
        e.noSpaceRaiseLower && this.root.push(new ae('w:noSpaceRaiseLower', e.noSpaceRaiseLower)),
        e.doNotUseHTMLParagraphAutoSpacing &&
          this.root.push(
            new ae('w:doNotUseHTMLParagraphAutoSpacing', e.doNotUseHTMLParagraphAutoSpacing),
          ),
        e.layoutRawTableWidth &&
          this.root.push(new ae('w:layoutRawTableWidth', e.layoutRawTableWidth)),
        e.layoutTableRowsApart &&
          this.root.push(new ae('w:layoutTableRowsApart', e.layoutTableRowsApart)),
        e.useWord97LineBreakRules &&
          this.root.push(new ae('w:useWord97LineBreakRules', e.useWord97LineBreakRules)),
        e.doNotBreakWrappedTables &&
          this.root.push(new ae('w:doNotBreakWrappedTables', e.doNotBreakWrappedTables)),
        e.doNotSnapToGridInCell &&
          this.root.push(new ae('w:doNotSnapToGridInCell', e.doNotSnapToGridInCell)),
        e.selectFieldWithFirstOrLastCharacter &&
          this.root.push(
            new ae('w:selectFldWithFirstOrLastChar', e.selectFieldWithFirstOrLastCharacter),
          ),
        e.applyBreakingRules &&
          this.root.push(new ae('w:applyBreakingRules', e.applyBreakingRules)),
        e.doNotWrapTextWithPunctuation &&
          this.root.push(new ae('w:doNotWrapTextWithPunct', e.doNotWrapTextWithPunctuation)),
        e.doNotUseEastAsianBreakRules &&
          this.root.push(new ae('w:doNotUseEastAsianBreakRules', e.doNotUseEastAsianBreakRules)),
        e.useWord2002TableStyleRules &&
          this.root.push(new ae('w:useWord2002TableStyleRules', e.useWord2002TableStyleRules)),
        e.growAutofit && this.root.push(new ae('w:growAutofit', e.growAutofit)),
        e.useFELayout && this.root.push(new ae('w:useFELayout', e.useFELayout)),
        e.useNormalStyleForList &&
          this.root.push(new ae('w:useNormalStyleForList', e.useNormalStyleForList)),
        e.doNotUseIndentAsNumberingTabStop &&
          this.root.push(
            new ae('w:doNotUseIndentAsNumberingTabStop', e.doNotUseIndentAsNumberingTabStop),
          ),
        e.useAlternateEastAsianLineBreakRules &&
          this.root.push(
            new ae('w:useAltKinsokuLineBreakRules', e.useAlternateEastAsianLineBreakRules),
          ),
        e.allowSpaceOfSameStyleInTable &&
          this.root.push(new ae('w:allowSpaceOfSameStyleInTable', e.allowSpaceOfSameStyleInTable)),
        e.doNotSuppressIndentation &&
          this.root.push(new ae('w:doNotSuppressIndentation', e.doNotSuppressIndentation)),
        e.doNotAutofitConstrainedTables &&
          this.root.push(
            new ae('w:doNotAutofitConstrainedTables', e.doNotAutofitConstrainedTables),
          ),
        e.autofitToFirstFixedWidthCell &&
          this.root.push(new ae('w:autofitToFirstFixedWidthCell', e.autofitToFirstFixedWidthCell)),
        e.underlineTabInNumberingList &&
          this.root.push(new ae('w:underlineTabInNumList', e.underlineTabInNumberingList)),
        e.displayHangulFixedWidth &&
          this.root.push(new ae('w:displayHangulFixedWidth', e.displayHangulFixedWidth)),
        e.splitPgBreakAndParaMark &&
          this.root.push(new ae('w:splitPgBreakAndParaMark', e.splitPgBreakAndParaMark)),
        e.doNotVerticallyAlignCellWithSp &&
          this.root.push(new ae('w:doNotVertAlignCellWithSp', e.doNotVerticallyAlignCellWithSp)),
        e.doNotBreakConstrainedForcedTable &&
          this.root.push(
            new ae('w:doNotBreakConstrainedForcedTable', e.doNotBreakConstrainedForcedTable),
          ),
        e.ignoreVerticalAlignmentInTextboxes &&
          this.root.push(new ae('w:doNotVertAlignInTxbx', e.ignoreVerticalAlignmentInTextboxes)),
        e.useAnsiKerningPairs &&
          this.root.push(new ae('w:useAnsiKerningPairs', e.useAnsiKerningPairs)),
        e.cachedColumnBalance &&
          this.root.push(new ae('w:cachedColBalance', e.cachedColumnBalance)))
    }
  },
  Qu = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          wpc: 'xmlns:wpc',
          mc: 'xmlns:mc',
          o: 'xmlns:o',
          r: 'xmlns:r',
          m: 'xmlns:m',
          v: 'xmlns:v',
          wp14: 'xmlns:wp14',
          wp: 'xmlns:wp',
          w10: 'xmlns:w10',
          w: 'xmlns:w',
          w14: 'xmlns:w14',
          w15: 'xmlns:w15',
          wpg: 'xmlns:wpg',
          wpi: 'xmlns:wpi',
          wne: 'xmlns:wne',
          wps: 'xmlns:wps',
          Ignorable: 'mc:Ignorable',
        }))
    }
  },
  ec = class extends M {
    constructor(e) {
      var r, n, i, s
      ;(super('w:settings'),
        this.root.push(
          new Qu({
            wpc: 'http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas',
            mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
            o: 'urn:schemas-microsoft-com:office:office',
            r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
            m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
            v: 'urn:schemas-microsoft-com:vml',
            wp14: 'http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing',
            wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
            w10: 'urn:schemas-microsoft-com:office:word',
            w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
            w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
            w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
            wpg: 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup',
            wpi: 'http://schemas.microsoft.com/office/word/2010/wordprocessingInk',
            wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
            wps: 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
            Ignorable: 'w14 w15 wp14',
          }),
        ),
        this.root.push(new ae('w:displayBackgroundShape', !0)),
        e.trackRevisions !== void 0 && this.root.push(new ae('w:trackRevisions', e.trackRevisions)),
        e.evenAndOddHeaders !== void 0 &&
          this.root.push(new ae('w:evenAndOddHeaders', e.evenAndOddHeaders)),
        e.updateFields !== void 0 && this.root.push(new ae('w:updateFields', e.updateFields)),
        e.defaultTabStop !== void 0 && this.root.push(new Fr('w:defaultTabStop', e.defaultTabStop)),
        this.root.push(
          new Ju(
            Ue(ye({}, (r = e.compatibility) != null ? r : {}), {
              version:
                (s =
                  (i = (n = e.compatibility) == null ? void 0 : n.version) != null
                    ? i
                    : e.compatibilityModeVersion) != null
                  ? s
                  : 15,
            }),
          ),
        ))
    }
  },
  Cn = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w:val' }))
    }
  },
  tc = class extends M {
    constructor(e) {
      ;(super('w:name'), this.root.push(new Cn({ val: e })))
    }
  },
  rc = class extends M {
    constructor(e) {
      ;(super('w:uiPriority'), this.root.push(new Cn({ val: De(e) })))
    }
  },
  nc = class extends ce {
    constructor() {
      ;(super(...arguments),
        $(this, 'xmlKeys', {
          type: 'w:type',
          styleId: 'w:styleId',
          default: 'w:default',
          customStyle: 'w:customStyle',
        }))
    }
  },
  On = class extends M {
    constructor(e, r) {
      ;(super('w:style'),
        this.root.push(new nc(e)),
        r.name && this.root.push(new tc(r.name)),
        r.basedOn && this.root.push(new lt('w:basedOn', r.basedOn)),
        r.next && this.root.push(new lt('w:next', r.next)),
        r.link && this.root.push(new lt('w:link', r.link)),
        r.uiPriority !== void 0 && this.root.push(new rc(r.uiPriority)),
        r.semiHidden !== void 0 && this.root.push(new ae('w:semiHidden', r.semiHidden)),
        r.unhideWhenUsed !== void 0 && this.root.push(new ae('w:unhideWhenUsed', r.unhideWhenUsed)),
        r.quickFormat !== void 0 && this.root.push(new ae('w:qFormat', r.quickFormat)))
    }
  },
  fr = class extends On {
    constructor(e) {
      ;(super({ type: 'paragraph', styleId: e.id }, e),
        $(this, 'paragraphProperties'),
        $(this, 'runProperties'),
        (this.paragraphProperties = new Ft(e.paragraph)),
        (this.runProperties = new pt(e.run)),
        this.root.push(this.paragraphProperties),
        this.root.push(this.runProperties))
    }
  },
  dr = class extends On {
    constructor(e) {
      ;(super({ type: 'character', styleId: e.id }, ye({ uiPriority: 99, unhideWhenUsed: !0 }, e)),
        $(this, 'runProperties'),
        (this.runProperties = new pt(e.run)),
        this.root.push(this.runProperties))
    }
  },
  yt = class extends fr {
    constructor(e) {
      super(ye({ basedOn: 'Normal', next: 'Normal', quickFormat: !0 }, e))
    }
  },
  ic = class extends yt {
    constructor(e) {
      super(ye({ id: 'Title', name: 'Title' }, e))
    }
  },
  sc = class extends yt {
    constructor(e) {
      super(ye({ id: 'Heading1', name: 'Heading 1' }, e))
    }
  },
  oc = class extends yt {
    constructor(e) {
      super(ye({ id: 'Heading2', name: 'Heading 2' }, e))
    }
  },
  ac = class extends yt {
    constructor(e) {
      super(ye({ id: 'Heading3', name: 'Heading 3' }, e))
    }
  },
  uc = class extends yt {
    constructor(e) {
      super(ye({ id: 'Heading4', name: 'Heading 4' }, e))
    }
  },
  cc = class extends yt {
    constructor(e) {
      super(ye({ id: 'Heading5', name: 'Heading 5' }, e))
    }
  },
  lc = class extends yt {
    constructor(e) {
      super(ye({ id: 'Heading6', name: 'Heading 6' }, e))
    }
  },
  hc = class extends yt {
    constructor(e) {
      super(ye({ id: 'Strong', name: 'Strong' }, e))
    }
  },
  fc = class extends fr {
    constructor(e) {
      super(
        ye({ id: 'ListParagraph', name: 'List Paragraph', basedOn: 'Normal', quickFormat: !0 }, e),
      )
    }
  },
  dc = class extends fr {
    constructor(e) {
      super(
        ye(
          {
            id: 'FootnoteText',
            name: 'footnote text',
            link: 'FootnoteTextChar',
            basedOn: 'Normal',
            uiPriority: 99,
            semiHidden: !0,
            unhideWhenUsed: !0,
            paragraph: { spacing: { after: 0, line: 240, lineRule: Fo.AUTO } },
            run: { size: 20 },
          },
          e,
        ),
      )
    }
  },
  pc = class extends dr {
    constructor(e) {
      super(
        ye(
          {
            id: 'FootnoteReference',
            name: 'footnote reference',
            basedOn: 'DefaultParagraphFont',
            semiHidden: !0,
            run: { superScript: !0 },
          },
          e,
        ),
      )
    }
  },
  mc = class extends dr {
    constructor(e) {
      super(
        ye(
          {
            id: 'FootnoteTextChar',
            name: 'Footnote Text Char',
            basedOn: 'DefaultParagraphFont',
            link: 'FootnoteText',
            semiHidden: !0,
            run: { size: 20 },
          },
          e,
        ),
      )
    }
  },
  wc = class extends dr {
    constructor(e) {
      super(
        ye(
          {
            id: 'Hyperlink',
            name: 'Hyperlink',
            basedOn: 'DefaultParagraphFont',
            run: { color: '0563C1', underline: { type: Ed.SINGLE } },
          },
          e,
        ),
      )
    }
  },
  Mr = class extends M {
    constructor(e) {
      if ((super('w:styles'), e.initialStyles && this.root.push(e.initialStyles), e.importedStyles))
        for (let r of e.importedStyles) this.root.push(r)
      if (e.paragraphStyles) for (let r of e.paragraphStyles) this.root.push(new fr(r))
      if (e.characterStyles) for (let r of e.characterStyles) this.root.push(new dr(r))
    }
  },
  gc = class extends M {
    constructor(e) {
      ;(super('w:pPrDefault'), this.root.push(new Ft(e)))
    }
  },
  yc = class extends M {
    constructor(e) {
      ;(super('w:rPrDefault'), this.root.push(new pt(e)))
    }
  },
  vc = class extends M {
    constructor(e) {
      ;(super('w:docDefaults'),
        $(this, 'runPropertiesDefaults'),
        $(this, 'paragraphPropertiesDefaults'),
        (this.runPropertiesDefaults = new yc(e.run)),
        (this.paragraphPropertiesDefaults = new gc(e.paragraph)),
        this.root.push(this.runPropertiesDefaults),
        this.root.push(this.paragraphPropertiesDefaults))
    }
  },
  _c = class {
    newInstance(e) {
      let r = Kn.xml2js(e, { compact: !1 }),
        n
      for (let a of r.elements || []) a.name === 'w:styles' && (n = a)
      if (n === void 0) throw new Error('can not find styles element')
      let i = n.elements || []
      return new Mr({ initialStyles: new ls(n.attributes), importedStyles: i.map((a) => $c(a)) })
    }
  },
  Dn = class {
    newInstance(e = {}) {
      var r
      return {
        initialStyles: new jt({
          mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
          r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
          w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
          w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
          w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
          Ignorable: 'w14 w15',
        }),
        importedStyles: [
          new vc((r = e.document) != null ? r : {}),
          new ic(ye({ run: { size: 56 } }, e.title)),
          new sc(ye({ run: { color: '2E74B5', size: 32 } }, e.heading1)),
          new oc(ye({ run: { color: '2E74B5', size: 26 } }, e.heading2)),
          new ac(ye({ run: { color: '1F4D78', size: 24 } }, e.heading3)),
          new uc(ye({ run: { color: '2E74B5', italics: !0 } }, e.heading4)),
          new cc(ye({ run: { color: '2E74B5' } }, e.heading5)),
          new lc(ye({ run: { color: '1F4D78' } }, e.heading6)),
          new hc(ye({ run: { bold: !0 } }, e.strong)),
          new fc(e.listParagraph || {}),
          new wc(e.hyperlink || {}),
          new pc(e.footnoteReference || {}),
          new dc(e.footnoteText || {}),
          new mc(e.footnoteTextChar || {}),
        ],
      }
    }
  },
  Sy = {
    ANSI: '00',
    DEFAULT: '01',
    SYMBOL: '02',
    MAC: '4D',
    JIS: '80',
    HANGUL: '81',
    JOHAB: '82',
    GB_2312: '86',
    CHINESEBIG5: '88',
    GREEK: 'A1',
    TURKISH: 'A2',
    VIETNAMESE: 'A3',
    HEBREW: 'B1',
    ARABIC: 'B2',
    BALTIC: 'BA',
    RUSSIAN: 'CC',
    THAI: 'DE',
    EASTEUROPE: 'EE',
    OEM: 'FF',
  },
  Qr = ({ id: t, fontKey: e, subsetted: r }, n) =>
    new Ie({
      name: n,
      attributes: ye(
        { id: { key: 'r:id', value: t } },
        e ? { fontKey: { key: 'w:fontKey', value: `{${e}}` } } : {},
      ),
      children: [...(r ? [new ae('w:subsetted', r)] : [])],
    }),
  J0 = ({
    name: t,
    altName: e,
    panose1: r,
    charset: n,
    family: i,
    notTrueType: s,
    pitch: a,
    sig: o,
    embedRegular: l,
    embedBold: p,
    embedItalic: g,
    embedBoldItalic: v,
  }) =>
    new Ie({
      name: 'w:font',
      attributes: { name: { key: 'w:name', value: t } },
      children: [
        ...(e ? [Er('w:altName', e)] : []),
        ...(r ? [Er('w:panose1', r)] : []),
        ...(n ? [Er('w:charset', n)] : []),
        ...(i ? [Er('w:family', i)] : []),
        ...(s ? [new ae('w:notTrueType', s)] : []),
        ...(a ? [Er('w:pitch', a)] : []),
        ...(o
          ? [
              new Ie({
                name: 'w:sig',
                attributes: {
                  usb0: { key: 'w:usb0', value: o.usb0 },
                  usb1: { key: 'w:usb1', value: o.usb1 },
                  usb2: { key: 'w:usb2', value: o.usb2 },
                  usb3: { key: 'w:usb3', value: o.usb3 },
                  csb0: { key: 'w:csb0', value: o.csb0 },
                  csb1: { key: 'w:csb1', value: o.csb1 },
                },
              }),
            ]
          : []),
        ...(l ? [Qr(l, 'w:embedRegular')] : []),
        ...(p ? [Qr(p, 'w:embedBold')] : []),
        ...(g ? [Qr(g, 'w:embedItalic')] : []),
        ...(v ? [Qr(v, 'w:embedBoldItalic')] : []),
      ],
    }),
  Q0 = ({ name: t, index: e, fontKey: r, characterSet: n }) =>
    J0({
      name: t,
      sig: {
        usb0: 'E0002AFF',
        usb1: 'C000247B',
        usb2: '00000009',
        usb3: '00000000',
        csb0: '000001FF',
        csb1: '00000000',
      },
      charset: n,
      family: 'auto',
      pitch: 'variable',
      embedRegular: { fontKey: r, id: `rId${e}` },
    }),
  eg = (t) =>
    new Ie({
      name: 'w:fonts',
      attributes: {
        mc: {
          key: 'xmlns:mc',
          value: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
        },
        r: {
          key: 'xmlns:r',
          value: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        },
        w: {
          key: 'xmlns:w',
          value: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        },
        w14: { key: 'xmlns:w14', value: 'http://schemas.microsoft.com/office/word/2010/wordml' },
        w15: { key: 'xmlns:w15', value: 'http://schemas.microsoft.com/office/word/2012/wordml' },
        w16cex: {
          key: 'xmlns:w16cex',
          value: 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
        },
        w16cid: {
          key: 'xmlns:w16cid',
          value: 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
        },
        w16: { key: 'xmlns:w16', value: 'http://schemas.microsoft.com/office/word/2018/wordml' },
        w16sdtdh: {
          key: 'xmlns:w16sdtdh',
          value: 'http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash',
        },
        w16se: {
          key: 'xmlns:w16se',
          value: 'http://schemas.microsoft.com/office/word/2015/wordml/symex',
        },
        Ignorable: { key: 'mc:Ignorable', value: 'w14 w15 w16se w16cid w16 w16cex w16sdtdh' },
      },
      children: t.map((e, r) => Q0({ name: e.name, index: r + 1, fontKey: e.fontKey })),
    }),
  bc = class {
    constructor(e) {
      ;($(this, 'fontTable'),
        $(this, 'relationships'),
        $(this, 'fontOptionsWithKey', []),
        (this.options = e),
        (this.fontOptionsWithKey = e.map((r) => Ue(ye({}, r), { fontKey: F0() }))),
        (this.fontTable = eg(this.fontOptionsWithKey)),
        (this.relationships = new Dt()))
      for (let r = 0; r < e.length; r++)
        this.relationships.createRelationship(
          r + 1,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/font',
          `fonts/${e[r].name}.odttf`,
        )
    }
    get View() {
      return this.fontTable
    }
    get Relationships() {
      return this.relationships
    }
  },
  yf = class {
    constructor(e) {
      ;($(this, 'currentRelationshipId', 1),
        $(this, 'documentWrapper'),
        $(this, 'headers', []),
        $(this, 'footers', []),
        $(this, 'coreProperties'),
        $(this, 'numbering'),
        $(this, 'media'),
        $(this, 'fileRelationships'),
        $(this, 'footnotesWrapper'),
        $(this, 'settings'),
        $(this, 'contentTypes'),
        $(this, 'customProperties'),
        $(this, 'appProperties'),
        $(this, 'styles'),
        $(this, 'comments'),
        $(this, 'fontWrapper'))
      var r, n, i, s, a, o, l, p
      if (
        ((this.coreProperties = new pu(
          Ue(ye({}, e), {
            creator: (r = e.creator) != null ? r : 'Un-named',
            revision: (n = e.revision) != null ? n : 1,
            lastModifiedBy: (i = e.lastModifiedBy) != null ? i : 'Un-named',
          }),
        )),
        (this.numbering = new Xu(e.numbering ? e.numbering : { config: [] })),
        (this.comments = new Oo((s = e.comments) != null ? s : { children: [] })),
        (this.fileRelationships = new Dt()),
        (this.customProperties = new vu((a = e.customProperties) != null ? a : [])),
        (this.appProperties = new cu()),
        (this.footnotesWrapper = new Cu()),
        (this.contentTypes = new du()),
        (this.documentWrapper = new vn({ background: e.background })),
        (this.settings = new ec({
          compatibilityModeVersion: e.compatabilityModeVersion,
          compatibility: e.compatibility,
          evenAndOddHeaders: !!e.evenAndOddHeaderAndFooters,
          trackRevisions: (o = e.features) == null ? void 0 : o.trackRevisions,
          updateFields: (l = e.features) == null ? void 0 : l.updateFields,
          defaultTabStop: e.defaultTabStop,
        })),
        (this.media = new In()),
        e.externalStyles !== void 0)
      ) {
        let g = new _c()
        this.styles = g.newInstance(e.externalStyles)
      } else if (e.styles) {
        let v = new Dn().newInstance(e.styles.default)
        this.styles = new Mr(ye(ye({}, v), e.styles))
      } else {
        let g = new Dn()
        this.styles = new Mr(g.newInstance())
      }
      this.addDefaultRelationships()
      for (let g of e.sections) this.addSection(g)
      if (e.footnotes)
        for (let g in e.footnotes)
          this.footnotesWrapper.View.createFootNote(parseFloat(g), e.footnotes[g].children)
      this.fontWrapper = new bc((p = e.fonts) != null ? p : [])
    }
    addSection({ headers: e = {}, footers: r = {}, children: n, properties: i }) {
      this.documentWrapper.View.Body.addSection(
        Ue(ye({}, i), {
          headerWrapperGroup: {
            default: e.default ? this.createHeader(e.default) : void 0,
            first: e.first ? this.createHeader(e.first) : void 0,
            even: e.even ? this.createHeader(e.even) : void 0,
          },
          footerWrapperGroup: {
            default: r.default ? this.createFooter(r.default) : void 0,
            first: r.first ? this.createFooter(r.first) : void 0,
            even: r.even ? this.createFooter(r.even) : void 0,
          },
        }),
      )
      for (let s of n) this.documentWrapper.View.add(s)
    }
    createHeader(e) {
      let r = new Du(this.media, this.currentRelationshipId++)
      for (let n of e.options.children) r.add(n)
      return (this.addHeaderToDocument(r), r)
    }
    createFooter(e) {
      let r = new bu(this.media, this.currentRelationshipId++)
      for (let n of e.options.children) r.add(n)
      return (this.addFooterToDocument(r), r)
    }
    addHeaderToDocument(e, r = tr.DEFAULT) {
      ;(this.headers.push({ header: e, type: r }),
        this.documentWrapper.Relationships.createRelationship(
          e.View.ReferenceId,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
          `header${this.headers.length}.xml`,
        ),
        this.contentTypes.addHeader(this.headers.length))
    }
    addFooterToDocument(e, r = tr.DEFAULT) {
      ;(this.footers.push({ footer: e, type: r }),
        this.documentWrapper.Relationships.createRelationship(
          e.View.ReferenceId,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
          `footer${this.footers.length}.xml`,
        ),
        this.contentTypes.addFooter(this.footers.length))
    }
    addDefaultRelationships() {
      ;(this.fileRelationships.createRelationship(
        1,
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
        'word/document.xml',
      ),
        this.fileRelationships.createRelationship(
          2,
          'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
          'docProps/core.xml',
        ),
        this.fileRelationships.createRelationship(
          3,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties',
          'docProps/app.xml',
        ),
        this.fileRelationships.createRelationship(
          4,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties',
          'docProps/custom.xml',
        ),
        this.documentWrapper.Relationships.createRelationship(
          this.currentRelationshipId++,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
          'styles.xml',
        ),
        this.documentWrapper.Relationships.createRelationship(
          this.currentRelationshipId++,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering',
          'numbering.xml',
        ),
        this.documentWrapper.Relationships.createRelationship(
          this.currentRelationshipId++,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes',
          'footnotes.xml',
        ),
        this.documentWrapper.Relationships.createRelationship(
          this.currentRelationshipId++,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',
          'settings.xml',
        ),
        this.documentWrapper.Relationships.createRelationship(
          this.currentRelationshipId++,
          'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
          'comments.xml',
        ))
    }
    get Document() {
      return this.documentWrapper
    }
    get Styles() {
      return this.styles
    }
    get CoreProperties() {
      return this.coreProperties
    }
    get Numbering() {
      return this.numbering
    }
    get Media() {
      return this.media
    }
    get FileRelationships() {
      return this.fileRelationships
    }
    get Headers() {
      return this.headers.map((e) => e.header)
    }
    get Footers() {
      return this.footers.map((e) => e.footer)
    }
    get ContentTypes() {
      return this.contentTypes
    }
    get CustomProperties() {
      return this.customProperties
    }
    get AppProperties() {
      return this.appProperties
    }
    get FootNotes() {
      return this.footnotesWrapper
    }
    get Settings() {
      return this.settings
    }
    get Comments() {
      return this.comments
    }
    get FontTable() {
      return this.fontWrapper
    }
  },
  Ec = class extends M {
    constructor(e = {}) {
      ;(super('w:instrText'),
        $(this, 'properties'),
        (this.properties = e),
        this.root.push(new Me({ space: Ke.PRESERVE })))
      let r = 'TOC'
      if (
        (this.properties.captionLabel && (r = `${r} \\a "${this.properties.captionLabel}"`),
        this.properties.entriesFromBookmark &&
          (r = `${r} \\b "${this.properties.entriesFromBookmark}"`),
        this.properties.captionLabelIncludingNumbers &&
          (r = `${r} \\c "${this.properties.captionLabelIncludingNumbers}"`),
        this.properties.sequenceAndPageNumbersSeparator &&
          (r = `${r} \\d "${this.properties.sequenceAndPageNumbersSeparator}"`),
        this.properties.tcFieldIdentifier &&
          (r = `${r} \\f "${this.properties.tcFieldIdentifier}"`),
        this.properties.hyperlink && (r = `${r} \\h`),
        this.properties.tcFieldLevelRange &&
          (r = `${r} \\l "${this.properties.tcFieldLevelRange}"`),
        this.properties.pageNumbersEntryLevelsRange &&
          (r = `${r} \\n "${this.properties.pageNumbersEntryLevelsRange}"`),
        this.properties.headingStyleRange &&
          (r = `${r} \\o "${this.properties.headingStyleRange}"`),
        this.properties.entryAndPageNumberSeparator &&
          (r = `${r} \\p "${this.properties.entryAndPageNumberSeparator}"`),
        this.properties.seqFieldIdentifierForPrefix &&
          (r = `${r} \\s "${this.properties.seqFieldIdentifierForPrefix}"`),
        this.properties.stylesWithLevels && this.properties.stylesWithLevels.length)
      ) {
        let n = this.properties.stylesWithLevels.map((i) => `${i.styleName},${i.level}`).join(',')
        r = `${r} \\t "${n}"`
      }
      ;(this.properties.useAppliedParagraphOutlineLevel && (r = `${r} \\u`),
        this.properties.preserveTabInEntries && (r = `${r} \\w`),
        this.properties.preserveNewLineInEntries && (r = `${r} \\x`),
        this.properties.hideTabAndPageNumbersInWebView && (r = `${r} \\z`),
        this.root.push(r))
    }
  },
  Fn = class extends M {
    constructor() {
      super('w:sdtContent')
    }
  },
  Ln = class extends M {
    constructor(e) {
      ;(super('w:sdtPr'), e && this.root.push(new lt('w:alias', e)))
    }
  },
  vf = class extends Ur {
    constructor(e = 'Table of Contents', r) {
      ;(super('w:sdt'), this.root.push(new Ln(e)))
      let n = new Fn(),
        i = new Nt({ children: [new He({ children: [new Ve(!0), new Ec(r), new Qe()] })] })
      n.addChildElement(i)
      let s = new Nt({ children: [new He({ children: [new qe()] })] })
      ;(n.addChildElement(s), this.root.push(n))
    }
  },
  _f = class {
    constructor(e, r) {
      ;($(this, 'styleName'), $(this, 'level'), (this.styleName = e), (this.level = r))
    }
  },
  bf = class {
    constructor(e = { children: [] }) {
      ;($(this, 'options'), (this.options = e))
    }
  },
  Ef = class {
    constructor(e = { children: [] }) {
      ;($(this, 'options'), (this.options = e))
    }
  },
  xc = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { id: 'w:id' }))
    }
  },
  Tc = class extends M {
    constructor(e) {
      ;(super('w:footnoteReference'), this.root.push(new xc({ id: e })))
    }
  },
  xf = class extends He {
    constructor(e) {
      ;(super({ style: 'FootnoteReference' }), this.root.push(new Tc(e)))
    }
  },
  Tf = class extends M {
    constructor(e) {
      ;(super('w:ins'),
        this.root.push(new Br({ id: e.id, author: e.author, date: e.date })),
        this.addChildElement(new ar(e)))
    }
  },
  Ac = class extends M {
    constructor() {
      ;(super('w:delInstrText'),
        this.root.push(new Me({ space: Ke.PRESERVE })),
        this.root.push('PAGE'))
    }
  },
  Sc = class extends M {
    constructor() {
      ;(super('w:delInstrText'),
        this.root.push(new Me({ space: Ke.PRESERVE })),
        this.root.push('NUMPAGES'))
    }
  },
  Ic = class extends M {
    constructor() {
      ;(super('w:delInstrText'),
        this.root.push(new Me({ space: Ke.PRESERVE })),
        this.root.push('SECTIONPAGES'))
    }
  },
  Bn = class extends M {
    constructor(e) {
      ;(super('w:delText'), this.root.push(new Me({ space: Ke.PRESERVE })), this.root.push(e))
    }
  },
  Af = class extends M {
    constructor(e) {
      ;(super('w:del'),
        $(this, 'deletedTextRunWrapper'),
        this.root.push(new Br({ id: e.id, author: e.author, date: e.date })),
        (this.deletedTextRunWrapper = new Rc(e)),
        this.addChildElement(this.deletedTextRunWrapper))
    }
  },
  Rc = class extends M {
    constructor(e) {
      if ((super('w:r'), this.root.push(new pt(e)), e.children))
        for (let r of e.children) {
          if (typeof r == 'string') {
            switch (r) {
              case Ht.CURRENT:
                ;(this.root.push(new Ve()),
                  this.root.push(new Ac()),
                  this.root.push(new Qe()),
                  this.root.push(new qe()))
                break
              case Ht.TOTAL_PAGES:
                ;(this.root.push(new Ve()),
                  this.root.push(new Sc()),
                  this.root.push(new Qe()),
                  this.root.push(new qe()))
                break
              case Ht.TOTAL_PAGES_IN_SECTION:
                ;(this.root.push(new Ve()),
                  this.root.push(new Ic()),
                  this.root.push(new Qe()),
                  this.root.push(new qe()))
                break
              default:
                this.root.push(new Bn(r))
                break
            }
            continue
          }
          this.root.push(r)
        }
      else e.text && this.root.push(new Bn(e.text))
      if (e.break) for (let r = 0; r < e.break; r++) this.root.splice(1, 0, new vd())
    }
  },
  Pn = class extends ce {
    constructor() {
      ;(super(...arguments), $(this, 'xmlKeys', { val: 'w14:val', symbolfont: 'w14:font' }))
    }
  },
  Dr = class extends M {
    constructor(e, r, n) {
      ;(super(e),
        n
          ? this.root.push(new Pn({ val: $m(r), symbolfont: n }))
          : this.root.push(new Pn({ val: r })))
    }
  },
  Nc = class extends M {
    constructor(e) {
      var r, n, i, s, a, o, l, p
      ;(super('w14:checkbox'),
        $(this, 'DEFAULT_UNCHECKED_SYMBOL', '2610'),
        $(this, 'DEFAULT_CHECKED_SYMBOL', '2612'),
        $(this, 'DEFAULT_FONT', 'MS Gothic'))
      let g = e?.checked ? '1' : '0',
        v,
        E
      ;(this.root.push(new Dr('w14:checked', g)),
        (v =
          (r = e?.checkedState) != null && r.value
            ? (n = e?.checkedState) == null
              ? void 0
              : n.value
            : this.DEFAULT_CHECKED_SYMBOL),
        (E =
          (i = e?.checkedState) != null && i.font
            ? (s = e?.checkedState) == null
              ? void 0
              : s.font
            : this.DEFAULT_FONT),
        this.root.push(new Dr('w14:checkedState', v, E)),
        (v =
          (a = e?.uncheckedState) != null && a.value
            ? (o = e?.uncheckedState) == null
              ? void 0
              : o.value
            : this.DEFAULT_UNCHECKED_SYMBOL),
        (E =
          (l = e?.uncheckedState) != null && l.font
            ? (p = e?.uncheckedState) == null
              ? void 0
              : p.font
            : this.DEFAULT_FONT),
        this.root.push(new Dr('w14:uncheckedState', v, E)))
    }
  },
  Sf = class extends M {
    constructor(e) {
      var r, n, i, s
      ;(super('w:sdt'),
        $(this, 'DEFAULT_UNCHECKED_SYMBOL', '2610'),
        $(this, 'DEFAULT_CHECKED_SYMBOL', '2612'),
        $(this, 'DEFAULT_FONT', 'MS Gothic'))
      let a = new Ln(e?.alias)
      ;(a.addChildElement(new Nc(e)), this.root.push(a))
      let o = new Fn(),
        l = (r = e?.checkedState) == null ? void 0 : r.font,
        p = (n = e?.checkedState) == null ? void 0 : n.value,
        g = (i = e?.uncheckedState) == null ? void 0 : i.font,
        v = (s = e?.uncheckedState) == null ? void 0 : s.value,
        E,
        d
      e?.checked
        ? ((E = l || this.DEFAULT_FONT), (d = p || this.DEFAULT_CHECKED_SYMBOL))
        : ((E = g || this.DEFAULT_FONT), (d = v || this.DEFAULT_UNCHECKED_SYMBOL))
      let x = new Os({ char: d, symbolfont: E })
      ;(o.addChildElement(x), this.root.push(o))
    }
  }
function en(t) {
  throw new Error(
    'Could not dynamically require "' +
      t +
      '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.',
  )
}
var Yd = { exports: {} }
;(function (t, e) {
  ;(function (r) {
    t.exports = r()
  })(function () {
    return (function r(n, i, s) {
      function a(p, g) {
        if (!i[p]) {
          if (!n[p]) {
            var v = typeof en == 'function' && en
            if (!g && v) return v(p, !0)
            if (o) return o(p, !0)
            var E = new Error("Cannot find module '" + p + "'")
            throw ((E.code = 'MODULE_NOT_FOUND'), E)
          }
          var d = (i[p] = { exports: {} })
          n[p][0].call(
            d.exports,
            function (x) {
              var b = n[p][1][x]
              return a(b || x)
            },
            d,
            d.exports,
            r,
            n,
            i,
            s,
          )
        }
        return i[p].exports
      }
      for (var o = typeof en == 'function' && en, l = 0; l < s.length; l++) a(s[l])
      return a
    })(
      {
        1: [
          function (r, n, i) {
            var s = r('./utils'),
              a = r('./support'),
              o = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
            ;((i.encode = function (l) {
              for (
                var p,
                  g,
                  v,
                  E,
                  d,
                  x,
                  b,
                  T = [],
                  m = 0,
                  A = l.length,
                  I = A,
                  D = s.getTypeOf(l) !== 'string';
                m < l.length;
              )
                ((I = A - m),
                  (v = D
                    ? ((p = l[m++]), (g = m < A ? l[m++] : 0), m < A ? l[m++] : 0)
                    : ((p = l.charCodeAt(m++)),
                      (g = m < A ? l.charCodeAt(m++) : 0),
                      m < A ? l.charCodeAt(m++) : 0)),
                  (E = p >> 2),
                  (d = ((3 & p) << 4) | (g >> 4)),
                  (x = 1 < I ? ((15 & g) << 2) | (v >> 6) : 64),
                  (b = 2 < I ? 63 & v : 64),
                  T.push(o.charAt(E) + o.charAt(d) + o.charAt(x) + o.charAt(b)))
              return T.join('')
            }),
              (i.decode = function (l) {
                var p,
                  g,
                  v,
                  E,
                  d,
                  x,
                  b = 0,
                  T = 0,
                  m = 'data:'
                if (l.substr(0, m.length) === m)
                  throw new Error('Invalid base64 input, it looks like a data url.')
                var A,
                  I = (3 * (l = l.replace(/[^A-Za-z0-9+/=]/g, '')).length) / 4
                if (
                  (l.charAt(l.length - 1) === o.charAt(64) && I--,
                  l.charAt(l.length - 2) === o.charAt(64) && I--,
                  I % 1 != 0)
                )
                  throw new Error('Invalid base64 input, bad content length.')
                for (A = a.uint8array ? new Uint8Array(0 | I) : new Array(0 | I); b < l.length; )
                  ((p = (o.indexOf(l.charAt(b++)) << 2) | ((E = o.indexOf(l.charAt(b++))) >> 4)),
                    (g = ((15 & E) << 4) | ((d = o.indexOf(l.charAt(b++))) >> 2)),
                    (v = ((3 & d) << 6) | (x = o.indexOf(l.charAt(b++)))),
                    (A[T++] = p),
                    d !== 64 && (A[T++] = g),
                    x !== 64 && (A[T++] = v))
                return A
              }))
          },
          { './support': 30, './utils': 32 },
        ],
        2: [
          function (r, n, i) {
            var s = r('./external'),
              a = r('./stream/DataWorker'),
              o = r('./stream/Crc32Probe'),
              l = r('./stream/DataLengthProbe')
            function p(g, v, E, d, x) {
              ;((this.compressedSize = g),
                (this.uncompressedSize = v),
                (this.crc32 = E),
                (this.compression = d),
                (this.compressedContent = x))
            }
            ;((p.prototype = {
              getContentWorker: function () {
                var g = new a(s.Promise.resolve(this.compressedContent))
                    .pipe(this.compression.uncompressWorker())
                    .pipe(new l('data_length')),
                  v = this
                return (
                  g.on('end', function () {
                    if (this.streamInfo.data_length !== v.uncompressedSize)
                      throw new Error('Bug : uncompressed data size mismatch')
                  }),
                  g
                )
              },
              getCompressedWorker: function () {
                return new a(s.Promise.resolve(this.compressedContent))
                  .withStreamInfo('compressedSize', this.compressedSize)
                  .withStreamInfo('uncompressedSize', this.uncompressedSize)
                  .withStreamInfo('crc32', this.crc32)
                  .withStreamInfo('compression', this.compression)
              },
            }),
              (p.createWorkerFrom = function (g, v, E) {
                return g
                  .pipe(new o())
                  .pipe(new l('uncompressedSize'))
                  .pipe(v.compressWorker(E))
                  .pipe(new l('compressedSize'))
                  .withStreamInfo('compression', v)
              }),
              (n.exports = p))
          },
          {
            './external': 6,
            './stream/Crc32Probe': 25,
            './stream/DataLengthProbe': 26,
            './stream/DataWorker': 27,
          },
        ],
        3: [
          function (r, n, i) {
            var s = r('./stream/GenericWorker')
            ;((i.STORE = {
              magic: '\0\0',
              compressWorker: function () {
                return new s('STORE compression')
              },
              uncompressWorker: function () {
                return new s('STORE decompression')
              },
            }),
              (i.DEFLATE = r('./flate')))
          },
          { './flate': 7, './stream/GenericWorker': 28 },
        ],
        4: [
          function (r, n, i) {
            var s = r('./utils'),
              a = (function () {
                for (var o, l = [], p = 0; p < 256; p++) {
                  o = p
                  for (var g = 0; g < 8; g++) o = 1 & o ? 3988292384 ^ (o >>> 1) : o >>> 1
                  l[p] = o
                }
                return l
              })()
            n.exports = function (o, l) {
              return o !== void 0 && o.length
                ? s.getTypeOf(o) !== 'string'
                  ? (function (p, g, v, E) {
                      var d = a,
                        x = E + v
                      p ^= -1
                      for (var b = E; b < x; b++) p = (p >>> 8) ^ d[255 & (p ^ g[b])]
                      return -1 ^ p
                    })(0 | l, o, o.length, 0)
                  : (function (p, g, v, E) {
                      var d = a,
                        x = E + v
                      p ^= -1
                      for (var b = E; b < x; b++) p = (p >>> 8) ^ d[255 & (p ^ g.charCodeAt(b))]
                      return -1 ^ p
                    })(0 | l, o, o.length, 0)
                : 0
            }
          },
          { './utils': 32 },
        ],
        5: [
          function (r, n, i) {
            ;((i.base64 = !1),
              (i.binary = !1),
              (i.dir = !1),
              (i.createFolders = !0),
              (i.date = null),
              (i.compression = null),
              (i.compressionOptions = null),
              (i.comment = null),
              (i.unixPermissions = null),
              (i.dosPermissions = null))
          },
          {},
        ],
        6: [
          function (r, n, i) {
            var s = null
            ;((s = typeof Promise < 'u' ? Promise : r('lie')), (n.exports = { Promise: s }))
          },
          { lie: 37 },
        ],
        7: [
          function (r, n, i) {
            var s = typeof Uint8Array < 'u' && typeof Uint16Array < 'u' && typeof Uint32Array < 'u',
              a = r('pako'),
              o = r('./utils'),
              l = r('./stream/GenericWorker'),
              p = s ? 'uint8array' : 'array'
            function g(v, E) {
              ;(l.call(this, 'FlateWorker/' + v),
                (this._pako = null),
                (this._pakoAction = v),
                (this._pakoOptions = E),
                (this.meta = {}))
            }
            ;((i.magic = '\b\0'),
              o.inherits(g, l),
              (g.prototype.processChunk = function (v) {
                ;((this.meta = v.meta),
                  this._pako === null && this._createPako(),
                  this._pako.push(o.transformTo(p, v.data), !1))
              }),
              (g.prototype.flush = function () {
                ;(l.prototype.flush.call(this),
                  this._pako === null && this._createPako(),
                  this._pako.push([], !0))
              }),
              (g.prototype.cleanUp = function () {
                ;(l.prototype.cleanUp.call(this), (this._pako = null))
              }),
              (g.prototype._createPako = function () {
                this._pako = new a[this._pakoAction]({
                  raw: !0,
                  level: this._pakoOptions.level || -1,
                })
                var v = this
                this._pako.onData = function (E) {
                  v.push({ data: E, meta: v.meta })
                }
              }),
              (i.compressWorker = function (v) {
                return new g('Deflate', v)
              }),
              (i.uncompressWorker = function () {
                return new g('Inflate', {})
              }))
          },
          { './stream/GenericWorker': 28, './utils': 32, pako: 38 },
        ],
        8: [
          function (r, n, i) {
            function s(d, x) {
              var b,
                T = ''
              for (b = 0; b < x; b++) ((T += String.fromCharCode(255 & d)), (d >>>= 8))
              return T
            }
            function a(d, x, b, T, m, A) {
              var I,
                D,
                L = d.file,
                q = d.compression,
                K = A !== p.utf8encode,
                J = o.transformTo('string', A(L.name)),
                R = o.transformTo('string', p.utf8encode(L.name)),
                oe = L.comment,
                he = o.transformTo('string', A(oe)),
                F = o.transformTo('string', p.utf8encode(oe)),
                V = R.length !== L.name.length,
                S = F.length !== oe.length,
                Y = '',
                le = '',
                Z = '',
                pe = L.dir,
                re = L.date,
                de = { crc32: 0, compressedSize: 0, uncompressedSize: 0 }
              ;(x && !b) ||
                ((de.crc32 = d.crc32),
                (de.compressedSize = d.compressedSize),
                (de.uncompressedSize = d.uncompressedSize))
              var j = 0
              ;(x && (j |= 8), K || (!V && !S) || (j |= 2048))
              var k = 0,
                z = 0
              ;(pe && (k |= 16),
                m === 'UNIX'
                  ? ((z = 798),
                    (k |= (function (te, W) {
                      var y = te
                      return (te || (y = W ? 16893 : 33204), (65535 & y) << 16)
                    })(L.unixPermissions, pe)))
                  : ((z = 20),
                    (k |= (function (te) {
                      return 63 & (te || 0)
                    })(L.dosPermissions))),
                (I = re.getUTCHours()),
                (I <<= 6),
                (I |= re.getUTCMinutes()),
                (I <<= 5),
                (I |= re.getUTCSeconds() / 2),
                (D = re.getUTCFullYear() - 1980),
                (D <<= 4),
                (D |= re.getUTCMonth() + 1),
                (D <<= 5),
                (D |= re.getUTCDate()),
                V && ((le = s(1, 1) + s(g(J), 4) + R), (Y += 'up' + s(le.length, 2) + le)),
                S && ((Z = s(1, 1) + s(g(he), 4) + F), (Y += 'uc' + s(Z.length, 2) + Z)))
              var G = ''
              return (
                (G += `
\0`),
                (G += s(j, 2)),
                (G += q.magic),
                (G += s(I, 2)),
                (G += s(D, 2)),
                (G += s(de.crc32, 4)),
                (G += s(de.compressedSize, 4)),
                (G += s(de.uncompressedSize, 4)),
                (G += s(J.length, 2)),
                (G += s(Y.length, 2)),
                {
                  fileRecord: v.LOCAL_FILE_HEADER + G + J + Y,
                  dirRecord:
                    v.CENTRAL_FILE_HEADER +
                    s(z, 2) +
                    G +
                    s(he.length, 2) +
                    '\0\0\0\0' +
                    s(k, 4) +
                    s(T, 4) +
                    J +
                    Y +
                    he,
                }
              )
            }
            var o = r('../utils'),
              l = r('../stream/GenericWorker'),
              p = r('../utf8'),
              g = r('../crc32'),
              v = r('../signature')
            function E(d, x, b, T) {
              ;(l.call(this, 'ZipFileWorker'),
                (this.bytesWritten = 0),
                (this.zipComment = x),
                (this.zipPlatform = b),
                (this.encodeFileName = T),
                (this.streamFiles = d),
                (this.accumulate = !1),
                (this.contentBuffer = []),
                (this.dirRecords = []),
                (this.currentSourceOffset = 0),
                (this.entriesCount = 0),
                (this.currentFile = null),
                (this._sources = []))
            }
            ;(o.inherits(E, l),
              (E.prototype.push = function (d) {
                var x = d.meta.percent || 0,
                  b = this.entriesCount,
                  T = this._sources.length
                this.accumulate
                  ? this.contentBuffer.push(d)
                  : ((this.bytesWritten += d.data.length),
                    l.prototype.push.call(this, {
                      data: d.data,
                      meta: {
                        currentFile: this.currentFile,
                        percent: b ? (x + 100 * (b - T - 1)) / b : 100,
                      },
                    }))
              }),
              (E.prototype.openedSource = function (d) {
                ;((this.currentSourceOffset = this.bytesWritten), (this.currentFile = d.file.name))
                var x = this.streamFiles && !d.file.dir
                if (x) {
                  var b = a(
                    d,
                    x,
                    !1,
                    this.currentSourceOffset,
                    this.zipPlatform,
                    this.encodeFileName,
                  )
                  this.push({ data: b.fileRecord, meta: { percent: 0 } })
                } else this.accumulate = !0
              }),
              (E.prototype.closedSource = function (d) {
                this.accumulate = !1
                var x = this.streamFiles && !d.file.dir,
                  b = a(d, x, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName)
                if ((this.dirRecords.push(b.dirRecord), x))
                  this.push({
                    data: (function (T) {
                      return (
                        v.DATA_DESCRIPTOR +
                        s(T.crc32, 4) +
                        s(T.compressedSize, 4) +
                        s(T.uncompressedSize, 4)
                      )
                    })(d),
                    meta: { percent: 100 },
                  })
                else
                  for (
                    this.push({ data: b.fileRecord, meta: { percent: 0 } });
                    this.contentBuffer.length;
                  )
                    this.push(this.contentBuffer.shift())
                this.currentFile = null
              }),
              (E.prototype.flush = function () {
                for (var d = this.bytesWritten, x = 0; x < this.dirRecords.length; x++)
                  this.push({ data: this.dirRecords[x], meta: { percent: 100 } })
                var b = this.bytesWritten - d,
                  T = (function (m, A, I, D, L) {
                    var q = o.transformTo('string', L(D))
                    return (
                      v.CENTRAL_DIRECTORY_END +
                      '\0\0\0\0' +
                      s(m, 2) +
                      s(m, 2) +
                      s(A, 4) +
                      s(I, 4) +
                      s(q.length, 2) +
                      q
                    )
                  })(this.dirRecords.length, b, d, this.zipComment, this.encodeFileName)
                this.push({ data: T, meta: { percent: 100 } })
              }),
              (E.prototype.prepareNextSource = function () {
                ;((this.previous = this._sources.shift()),
                  this.openedSource(this.previous.streamInfo),
                  this.isPaused ? this.previous.pause() : this.previous.resume())
              }),
              (E.prototype.registerPrevious = function (d) {
                this._sources.push(d)
                var x = this
                return (
                  d.on('data', function (b) {
                    x.processChunk(b)
                  }),
                  d.on('end', function () {
                    ;(x.closedSource(x.previous.streamInfo),
                      x._sources.length ? x.prepareNextSource() : x.end())
                  }),
                  d.on('error', function (b) {
                    x.error(b)
                  }),
                  this
                )
              }),
              (E.prototype.resume = function () {
                return (
                  !!l.prototype.resume.call(this) &&
                  (!this.previous && this._sources.length
                    ? (this.prepareNextSource(), !0)
                    : this.previous || this._sources.length || this.generatedError
                      ? void 0
                      : (this.end(), !0))
                )
              }),
              (E.prototype.error = function (d) {
                var x = this._sources
                if (!l.prototype.error.call(this, d)) return !1
                for (var b = 0; b < x.length; b++)
                  try {
                    x[b].error(d)
                  } catch {}
                return !0
              }),
              (E.prototype.lock = function () {
                l.prototype.lock.call(this)
                for (var d = this._sources, x = 0; x < d.length; x++) d[x].lock()
              }),
              (n.exports = E))
          },
          {
            '../crc32': 4,
            '../signature': 23,
            '../stream/GenericWorker': 28,
            '../utf8': 31,
            '../utils': 32,
          },
        ],
        9: [
          function (r, n, i) {
            var s = r('../compressions'),
              a = r('./ZipFileWorker')
            i.generateWorker = function (o, l, p) {
              var g = new a(l.streamFiles, p, l.platform, l.encodeFileName),
                v = 0
              try {
                ;(o.forEach(function (E, d) {
                  v++
                  var x = (function (A, I) {
                      var D = A || I,
                        L = s[D]
                      if (!L) throw new Error(D + ' is not a valid compression method !')
                      return L
                    })(d.options.compression, l.compression),
                    b = d.options.compressionOptions || l.compressionOptions || {},
                    T = d.dir,
                    m = d.date
                  d._compressWorker(x, b)
                    .withStreamInfo('file', {
                      name: E,
                      dir: T,
                      date: m,
                      comment: d.comment || '',
                      unixPermissions: d.unixPermissions,
                      dosPermissions: d.dosPermissions,
                    })
                    .pipe(g)
                }),
                  (g.entriesCount = v))
              } catch (E) {
                g.error(E)
              }
              return g
            }
          },
          { '../compressions': 3, './ZipFileWorker': 8 },
        ],
        10: [
          function (r, n, i) {
            function s() {
              if (!(this instanceof s)) return new s()
              if (arguments.length)
                throw new Error(
                  'The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.',
                )
              ;((this.files = Object.create(null)),
                (this.comment = null),
                (this.root = ''),
                (this.clone = function () {
                  var a = new s()
                  for (var o in this) typeof this[o] != 'function' && (a[o] = this[o])
                  return a
                }))
            }
            ;(((s.prototype = r('./object')).loadAsync = r('./load')),
              (s.support = r('./support')),
              (s.defaults = r('./defaults')),
              (s.version = '3.10.1'),
              (s.loadAsync = function (a, o) {
                return new s().loadAsync(a, o)
              }),
              (s.external = r('./external')),
              (n.exports = s))
          },
          { './defaults': 5, './external': 6, './load': 11, './object': 15, './support': 30 },
        ],
        11: [
          function (r, n, i) {
            var s = r('./utils'),
              a = r('./external'),
              o = r('./utf8'),
              l = r('./zipEntries'),
              p = r('./stream/Crc32Probe'),
              g = r('./nodejsUtils')
            function v(E) {
              return new a.Promise(function (d, x) {
                var b = E.decompressed.getContentWorker().pipe(new p())
                b.on('error', function (T) {
                  x(T)
                })
                  .on('end', function () {
                    b.streamInfo.crc32 !== E.decompressed.crc32
                      ? x(new Error('Corrupted zip : CRC32 mismatch'))
                      : d()
                  })
                  .resume()
              })
            }
            n.exports = function (E, d) {
              var x = this
              return (
                (d = s.extend(d || {}, {
                  base64: !1,
                  checkCRC32: !1,
                  optimizedBinaryString: !1,
                  createFolders: !1,
                  decodeFileName: o.utf8decode,
                })),
                g.isNode && g.isStream(E)
                  ? a.Promise.reject(
                      new Error("JSZip can't accept a stream when loading a zip file."),
                    )
                  : s
                      .prepareContent(
                        'the loaded zip file',
                        E,
                        !0,
                        d.optimizedBinaryString,
                        d.base64,
                      )
                      .then(function (b) {
                        var T = new l(d)
                        return (T.load(b), T)
                      })
                      .then(function (b) {
                        var T = [a.Promise.resolve(b)],
                          m = b.files
                        if (d.checkCRC32) for (var A = 0; A < m.length; A++) T.push(v(m[A]))
                        return a.Promise.all(T)
                      })
                      .then(function (b) {
                        for (var T = b.shift(), m = T.files, A = 0; A < m.length; A++) {
                          var I = m[A],
                            D = I.fileNameStr,
                            L = s.resolve(I.fileNameStr)
                          ;(x.file(L, I.decompressed, {
                            binary: !0,
                            optimizedBinaryString: !0,
                            date: I.date,
                            dir: I.dir,
                            comment: I.fileCommentStr.length ? I.fileCommentStr : null,
                            unixPermissions: I.unixPermissions,
                            dosPermissions: I.dosPermissions,
                            createFolders: d.createFolders,
                          }),
                            I.dir || (x.file(L).unsafeOriginalName = D))
                        }
                        return (T.zipComment.length && (x.comment = T.zipComment), x)
                      })
              )
            }
          },
          {
            './external': 6,
            './nodejsUtils': 14,
            './stream/Crc32Probe': 25,
            './utf8': 31,
            './utils': 32,
            './zipEntries': 33,
          },
        ],
        12: [
          function (r, n, i) {
            var s = r('../utils'),
              a = r('../stream/GenericWorker')
            function o(l, p) {
              ;(a.call(this, 'Nodejs stream input adapter for ' + l),
                (this._upstreamEnded = !1),
                this._bindStream(p))
            }
            ;(s.inherits(o, a),
              (o.prototype._bindStream = function (l) {
                var p = this
                ;((this._stream = l).pause(),
                  l
                    .on('data', function (g) {
                      p.push({ data: g, meta: { percent: 0 } })
                    })
                    .on('error', function (g) {
                      p.isPaused ? (this.generatedError = g) : p.error(g)
                    })
                    .on('end', function () {
                      p.isPaused ? (p._upstreamEnded = !0) : p.end()
                    }))
              }),
              (o.prototype.pause = function () {
                return !!a.prototype.pause.call(this) && (this._stream.pause(), !0)
              }),
              (o.prototype.resume = function () {
                return (
                  !!a.prototype.resume.call(this) &&
                  (this._upstreamEnded ? this.end() : this._stream.resume(), !0)
                )
              }),
              (n.exports = o))
          },
          { '../stream/GenericWorker': 28, '../utils': 32 },
        ],
        13: [
          function (r, n, i) {
            var s = r('readable-stream').Readable
            function a(o, l, p) {
              ;(s.call(this, l), (this._helper = o))
              var g = this
              o.on('data', function (v, E) {
                ;(g.push(v) || g._helper.pause(), p && p(E))
              })
                .on('error', function (v) {
                  g.emit('error', v)
                })
                .on('end', function () {
                  g.push(null)
                })
            }
            ;(r('../utils').inherits(a, s),
              (a.prototype._read = function () {
                this._helper.resume()
              }),
              (n.exports = a))
          },
          { '../utils': 32, 'readable-stream': 16 },
        ],
        14: [
          function (r, n, i) {
            n.exports = {
              isNode: typeof Buffer < 'u',
              newBufferFrom: function (s, a) {
                if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(s, a)
                if (typeof s == 'number')
                  throw new Error('The "data" argument must not be a number')
                return new Buffer(s, a)
              },
              allocBuffer: function (s) {
                if (Buffer.alloc) return Buffer.alloc(s)
                var a = new Buffer(s)
                return (a.fill(0), a)
              },
              isBuffer: function (s) {
                return Buffer.isBuffer(s)
              },
              isStream: function (s) {
                return (
                  s &&
                  typeof s.on == 'function' &&
                  typeof s.pause == 'function' &&
                  typeof s.resume == 'function'
                )
              },
            }
          },
          {},
        ],
        15: [
          function (r, n, i) {
            function s(L, q, K) {
              var J,
                R = o.getTypeOf(q),
                oe = o.extend(K || {}, g)
              ;((oe.date = oe.date || new Date()),
                oe.compression !== null && (oe.compression = oe.compression.toUpperCase()),
                typeof oe.unixPermissions == 'string' &&
                  (oe.unixPermissions = parseInt(oe.unixPermissions, 8)),
                oe.unixPermissions && 16384 & oe.unixPermissions && (oe.dir = !0),
                oe.dosPermissions && 16 & oe.dosPermissions && (oe.dir = !0),
                oe.dir && (L = m(L)),
                oe.createFolders && (J = T(L)) && A.call(this, J, !0))
              var he = R === 'string' && oe.binary === !1 && oe.base64 === !1
              ;((K && K.binary !== void 0) || (oe.binary = !he),
                ((q instanceof v && q.uncompressedSize === 0) || oe.dir || !q || q.length === 0) &&
                  ((oe.base64 = !1),
                  (oe.binary = !0),
                  (q = ''),
                  (oe.compression = 'STORE'),
                  (R = 'string')))
              var F = null
              F =
                q instanceof v || q instanceof l
                  ? q
                  : x.isNode && x.isStream(q)
                    ? new b(L, q)
                    : o.prepareContent(L, q, oe.binary, oe.optimizedBinaryString, oe.base64)
              var V = new E(L, F, oe)
              this.files[L] = V
            }
            var a = r('./utf8'),
              o = r('./utils'),
              l = r('./stream/GenericWorker'),
              p = r('./stream/StreamHelper'),
              g = r('./defaults'),
              v = r('./compressedObject'),
              E = r('./zipObject'),
              d = r('./generate'),
              x = r('./nodejsUtils'),
              b = r('./nodejs/NodejsStreamInputAdapter'),
              T = function (L) {
                L.slice(-1) === '/' && (L = L.substring(0, L.length - 1))
                var q = L.lastIndexOf('/')
                return 0 < q ? L.substring(0, q) : ''
              },
              m = function (L) {
                return (L.slice(-1) !== '/' && (L += '/'), L)
              },
              A = function (L, q) {
                return (
                  (q = q !== void 0 ? q : g.createFolders),
                  (L = m(L)),
                  this.files[L] || s.call(this, L, null, { dir: !0, createFolders: q }),
                  this.files[L]
                )
              }
            function I(L) {
              return Object.prototype.toString.call(L) === '[object RegExp]'
            }
            var D = {
              load: function () {
                throw new Error(
                  'This method has been removed in JSZip 3.0, please check the upgrade guide.',
                )
              },
              forEach: function (L) {
                var q, K, J
                for (q in this.files)
                  ((J = this.files[q]),
                    (K = q.slice(this.root.length, q.length)) &&
                      q.slice(0, this.root.length) === this.root &&
                      L(K, J))
              },
              filter: function (L) {
                var q = []
                return (
                  this.forEach(function (K, J) {
                    L(K, J) && q.push(J)
                  }),
                  q
                )
              },
              file: function (L, q, K) {
                if (arguments.length !== 1)
                  return ((L = this.root + L), s.call(this, L, q, K), this)
                if (I(L)) {
                  var J = L
                  return this.filter(function (oe, he) {
                    return !he.dir && J.test(oe)
                  })
                }
                var R = this.files[this.root + L]
                return R && !R.dir ? R : null
              },
              folder: function (L) {
                if (!L) return this
                if (I(L))
                  return this.filter(function (R, oe) {
                    return oe.dir && L.test(R)
                  })
                var q = this.root + L,
                  K = A.call(this, q),
                  J = this.clone()
                return ((J.root = K.name), J)
              },
              remove: function (L) {
                L = this.root + L
                var q = this.files[L]
                if ((q || (L.slice(-1) !== '/' && (L += '/'), (q = this.files[L])), q && !q.dir))
                  delete this.files[L]
                else
                  for (
                    var K = this.filter(function (R, oe) {
                        return oe.name.slice(0, L.length) === L
                      }),
                      J = 0;
                    J < K.length;
                    J++
                  )
                    delete this.files[K[J].name]
                return this
              },
              generate: function () {
                throw new Error(
                  'This method has been removed in JSZip 3.0, please check the upgrade guide.',
                )
              },
              generateInternalStream: function (L) {
                var q,
                  K = {}
                try {
                  if (
                    (((K = o.extend(L || {}, {
                      streamFiles: !1,
                      compression: 'STORE',
                      compressionOptions: null,
                      type: '',
                      platform: 'DOS',
                      comment: null,
                      mimeType: 'application/zip',
                      encodeFileName: a.utf8encode,
                    })).type = K.type.toLowerCase()),
                    (K.compression = K.compression.toUpperCase()),
                    K.type === 'binarystring' && (K.type = 'string'),
                    !K.type)
                  )
                    throw new Error('No output type specified.')
                  ;(o.checkSupport(K.type),
                    (K.platform !== 'darwin' &&
                      K.platform !== 'freebsd' &&
                      K.platform !== 'linux' &&
                      K.platform !== 'sunos') ||
                      (K.platform = 'UNIX'),
                    K.platform === 'win32' && (K.platform = 'DOS'))
                  var J = K.comment || this.comment || ''
                  q = d.generateWorker(this, K, J)
                } catch (R) {
                  ;(q = new l('error')).error(R)
                }
                return new p(q, K.type || 'string', K.mimeType)
              },
              generateAsync: function (L, q) {
                return this.generateInternalStream(L).accumulate(q)
              },
              generateNodeStream: function (L, q) {
                return (
                  (L = L || {}).type || (L.type = 'nodebuffer'),
                  this.generateInternalStream(L).toNodejsStream(q)
                )
              },
            }
            n.exports = D
          },
          {
            './compressedObject': 2,
            './defaults': 5,
            './generate': 9,
            './nodejs/NodejsStreamInputAdapter': 12,
            './nodejsUtils': 14,
            './stream/GenericWorker': 28,
            './stream/StreamHelper': 29,
            './utf8': 31,
            './utils': 32,
            './zipObject': 35,
          },
        ],
        16: [
          function (r, n, i) {
            n.exports = r('stream')
          },
          { stream: void 0 },
        ],
        17: [
          function (r, n, i) {
            var s = r('./DataReader')
            function a(o) {
              s.call(this, o)
              for (var l = 0; l < this.data.length; l++) o[l] = 255 & o[l]
            }
            ;(r('../utils').inherits(a, s),
              (a.prototype.byteAt = function (o) {
                return this.data[this.zero + o]
              }),
              (a.prototype.lastIndexOfSignature = function (o) {
                for (
                  var l = o.charCodeAt(0),
                    p = o.charCodeAt(1),
                    g = o.charCodeAt(2),
                    v = o.charCodeAt(3),
                    E = this.length - 4;
                  0 <= E;
                  --E
                )
                  if (
                    this.data[E] === l &&
                    this.data[E + 1] === p &&
                    this.data[E + 2] === g &&
                    this.data[E + 3] === v
                  )
                    return E - this.zero
                return -1
              }),
              (a.prototype.readAndCheckSignature = function (o) {
                var l = o.charCodeAt(0),
                  p = o.charCodeAt(1),
                  g = o.charCodeAt(2),
                  v = o.charCodeAt(3),
                  E = this.readData(4)
                return l === E[0] && p === E[1] && g === E[2] && v === E[3]
              }),
              (a.prototype.readData = function (o) {
                if ((this.checkOffset(o), o === 0)) return []
                var l = this.data.slice(this.zero + this.index, this.zero + this.index + o)
                return ((this.index += o), l)
              }),
              (n.exports = a))
          },
          { '../utils': 32, './DataReader': 18 },
        ],
        18: [
          function (r, n, i) {
            var s = r('../utils')
            function a(o) {
              ;((this.data = o), (this.length = o.length), (this.index = 0), (this.zero = 0))
            }
            ;((a.prototype = {
              checkOffset: function (o) {
                this.checkIndex(this.index + o)
              },
              checkIndex: function (o) {
                if (this.length < this.zero + o || o < 0)
                  throw new Error(
                    'End of data reached (data length = ' +
                      this.length +
                      ', asked index = ' +
                      o +
                      '). Corrupted zip ?',
                  )
              },
              setIndex: function (o) {
                ;(this.checkIndex(o), (this.index = o))
              },
              skip: function (o) {
                this.setIndex(this.index + o)
              },
              byteAt: function () {},
              readInt: function (o) {
                var l,
                  p = 0
                for (this.checkOffset(o), l = this.index + o - 1; l >= this.index; l--)
                  p = (p << 8) + this.byteAt(l)
                return ((this.index += o), p)
              },
              readString: function (o) {
                return s.transformTo('string', this.readData(o))
              },
              readData: function () {},
              lastIndexOfSignature: function () {},
              readAndCheckSignature: function () {},
              readDate: function () {
                var o = this.readInt(4)
                return new Date(
                  Date.UTC(
                    1980 + ((o >> 25) & 127),
                    ((o >> 21) & 15) - 1,
                    (o >> 16) & 31,
                    (o >> 11) & 31,
                    (o >> 5) & 63,
                    (31 & o) << 1,
                  ),
                )
              },
            }),
              (n.exports = a))
          },
          { '../utils': 32 },
        ],
        19: [
          function (r, n, i) {
            var s = r('./Uint8ArrayReader')
            function a(o) {
              s.call(this, o)
            }
            ;(r('../utils').inherits(a, s),
              (a.prototype.readData = function (o) {
                this.checkOffset(o)
                var l = this.data.slice(this.zero + this.index, this.zero + this.index + o)
                return ((this.index += o), l)
              }),
              (n.exports = a))
          },
          { '../utils': 32, './Uint8ArrayReader': 21 },
        ],
        20: [
          function (r, n, i) {
            var s = r('./DataReader')
            function a(o) {
              s.call(this, o)
            }
            ;(r('../utils').inherits(a, s),
              (a.prototype.byteAt = function (o) {
                return this.data.charCodeAt(this.zero + o)
              }),
              (a.prototype.lastIndexOfSignature = function (o) {
                return this.data.lastIndexOf(o) - this.zero
              }),
              (a.prototype.readAndCheckSignature = function (o) {
                return o === this.readData(4)
              }),
              (a.prototype.readData = function (o) {
                this.checkOffset(o)
                var l = this.data.slice(this.zero + this.index, this.zero + this.index + o)
                return ((this.index += o), l)
              }),
              (n.exports = a))
          },
          { '../utils': 32, './DataReader': 18 },
        ],
        21: [
          function (r, n, i) {
            var s = r('./ArrayReader')
            function a(o) {
              s.call(this, o)
            }
            ;(r('../utils').inherits(a, s),
              (a.prototype.readData = function (o) {
                if ((this.checkOffset(o), o === 0)) return new Uint8Array(0)
                var l = this.data.subarray(this.zero + this.index, this.zero + this.index + o)
                return ((this.index += o), l)
              }),
              (n.exports = a))
          },
          { '../utils': 32, './ArrayReader': 17 },
        ],
        22: [
          function (r, n, i) {
            var s = r('../utils'),
              a = r('../support'),
              o = r('./ArrayReader'),
              l = r('./StringReader'),
              p = r('./NodeBufferReader'),
              g = r('./Uint8ArrayReader')
            n.exports = function (v) {
              var E = s.getTypeOf(v)
              return (
                s.checkSupport(E),
                E !== 'string' || a.uint8array
                  ? E === 'nodebuffer'
                    ? new p(v)
                    : a.uint8array
                      ? new g(s.transformTo('uint8array', v))
                      : new o(s.transformTo('array', v))
                  : new l(v)
              )
            }
          },
          {
            '../support': 30,
            '../utils': 32,
            './ArrayReader': 17,
            './NodeBufferReader': 19,
            './StringReader': 20,
            './Uint8ArrayReader': 21,
          },
        ],
        23: [
          function (r, n, i) {
            ;((i.LOCAL_FILE_HEADER = 'PK'),
              (i.CENTRAL_FILE_HEADER = 'PK'),
              (i.CENTRAL_DIRECTORY_END = 'PK'),
              (i.ZIP64_CENTRAL_DIRECTORY_LOCATOR = 'PK\x07'),
              (i.ZIP64_CENTRAL_DIRECTORY_END = 'PK'),
              (i.DATA_DESCRIPTOR = 'PK\x07\b'))
          },
          {},
        ],
        24: [
          function (r, n, i) {
            var s = r('./GenericWorker'),
              a = r('../utils')
            function o(l) {
              ;(s.call(this, 'ConvertWorker to ' + l), (this.destType = l))
            }
            ;(a.inherits(o, s),
              (o.prototype.processChunk = function (l) {
                this.push({ data: a.transformTo(this.destType, l.data), meta: l.meta })
              }),
              (n.exports = o))
          },
          { '../utils': 32, './GenericWorker': 28 },
        ],
        25: [
          function (r, n, i) {
            var s = r('./GenericWorker'),
              a = r('../crc32')
            function o() {
              ;(s.call(this, 'Crc32Probe'), this.withStreamInfo('crc32', 0))
            }
            ;(r('../utils').inherits(o, s),
              (o.prototype.processChunk = function (l) {
                ;((this.streamInfo.crc32 = a(l.data, this.streamInfo.crc32 || 0)), this.push(l))
              }),
              (n.exports = o))
          },
          { '../crc32': 4, '../utils': 32, './GenericWorker': 28 },
        ],
        26: [
          function (r, n, i) {
            var s = r('../utils'),
              a = r('./GenericWorker')
            function o(l) {
              ;(a.call(this, 'DataLengthProbe for ' + l),
                (this.propName = l),
                this.withStreamInfo(l, 0))
            }
            ;(s.inherits(o, a),
              (o.prototype.processChunk = function (l) {
                if (l) {
                  var p = this.streamInfo[this.propName] || 0
                  this.streamInfo[this.propName] = p + l.data.length
                }
                a.prototype.processChunk.call(this, l)
              }),
              (n.exports = o))
          },
          { '../utils': 32, './GenericWorker': 28 },
        ],
        27: [
          function (r, n, i) {
            var s = r('../utils'),
              a = r('./GenericWorker')
            function o(l) {
              a.call(this, 'DataWorker')
              var p = this
              ;((this.dataIsReady = !1),
                (this.index = 0),
                (this.max = 0),
                (this.data = null),
                (this.type = ''),
                (this._tickScheduled = !1),
                l.then(
                  function (g) {
                    ;((p.dataIsReady = !0),
                      (p.data = g),
                      (p.max = (g && g.length) || 0),
                      (p.type = s.getTypeOf(g)),
                      p.isPaused || p._tickAndRepeat())
                  },
                  function (g) {
                    p.error(g)
                  },
                ))
            }
            ;(s.inherits(o, a),
              (o.prototype.cleanUp = function () {
                ;(a.prototype.cleanUp.call(this), (this.data = null))
              }),
              (o.prototype.resume = function () {
                return (
                  !!a.prototype.resume.call(this) &&
                  (!this._tickScheduled &&
                    this.dataIsReady &&
                    ((this._tickScheduled = !0), s.delay(this._tickAndRepeat, [], this)),
                  !0)
                )
              }),
              (o.prototype._tickAndRepeat = function () {
                ;((this._tickScheduled = !1),
                  this.isPaused ||
                    this.isFinished ||
                    (this._tick(),
                    this.isFinished ||
                      (s.delay(this._tickAndRepeat, [], this), (this._tickScheduled = !0))))
              }),
              (o.prototype._tick = function () {
                if (this.isPaused || this.isFinished) return !1
                var l = null,
                  p = Math.min(this.max, this.index + 16384)
                if (this.index >= this.max) return this.end()
                switch (this.type) {
                  case 'string':
                    l = this.data.substring(this.index, p)
                    break
                  case 'uint8array':
                    l = this.data.subarray(this.index, p)
                    break
                  case 'array':
                  case 'nodebuffer':
                    l = this.data.slice(this.index, p)
                }
                return (
                  (this.index = p),
                  this.push({
                    data: l,
                    meta: { percent: this.max ? (this.index / this.max) * 100 : 0 },
                  })
                )
              }),
              (n.exports = o))
          },
          { '../utils': 32, './GenericWorker': 28 },
        ],
        28: [
          function (r, n, i) {
            function s(a) {
              ;((this.name = a || 'default'),
                (this.streamInfo = {}),
                (this.generatedError = null),
                (this.extraStreamInfo = {}),
                (this.isPaused = !0),
                (this.isFinished = !1),
                (this.isLocked = !1),
                (this._listeners = { data: [], end: [], error: [] }),
                (this.previous = null))
            }
            ;((s.prototype = {
              push: function (a) {
                this.emit('data', a)
              },
              end: function () {
                if (this.isFinished) return !1
                this.flush()
                try {
                  ;(this.emit('end'), this.cleanUp(), (this.isFinished = !0))
                } catch (a) {
                  this.emit('error', a)
                }
                return !0
              },
              error: function (a) {
                return (
                  !this.isFinished &&
                  (this.isPaused
                    ? (this.generatedError = a)
                    : ((this.isFinished = !0),
                      this.emit('error', a),
                      this.previous && this.previous.error(a),
                      this.cleanUp()),
                  !0)
                )
              },
              on: function (a, o) {
                return (this._listeners[a].push(o), this)
              },
              cleanUp: function () {
                ;((this.streamInfo = this.generatedError = this.extraStreamInfo = null),
                  (this._listeners = []))
              },
              emit: function (a, o) {
                if (this._listeners[a])
                  for (var l = 0; l < this._listeners[a].length; l++)
                    this._listeners[a][l].call(this, o)
              },
              pipe: function (a) {
                return a.registerPrevious(this)
              },
              registerPrevious: function (a) {
                if (this.isLocked)
                  throw new Error("The stream '" + this + "' has already been used.")
                ;((this.streamInfo = a.streamInfo), this.mergeStreamInfo(), (this.previous = a))
                var o = this
                return (
                  a.on('data', function (l) {
                    o.processChunk(l)
                  }),
                  a.on('end', function () {
                    o.end()
                  }),
                  a.on('error', function (l) {
                    o.error(l)
                  }),
                  this
                )
              },
              pause: function () {
                return (
                  !this.isPaused &&
                  !this.isFinished &&
                  ((this.isPaused = !0), this.previous && this.previous.pause(), !0)
                )
              },
              resume: function () {
                if (!this.isPaused || this.isFinished) return !1
                var a = (this.isPaused = !1)
                return (
                  this.generatedError && (this.error(this.generatedError), (a = !0)),
                  this.previous && this.previous.resume(),
                  !a
                )
              },
              flush: function () {},
              processChunk: function (a) {
                this.push(a)
              },
              withStreamInfo: function (a, o) {
                return ((this.extraStreamInfo[a] = o), this.mergeStreamInfo(), this)
              },
              mergeStreamInfo: function () {
                for (var a in this.extraStreamInfo)
                  Object.prototype.hasOwnProperty.call(this.extraStreamInfo, a) &&
                    (this.streamInfo[a] = this.extraStreamInfo[a])
              },
              lock: function () {
                if (this.isLocked)
                  throw new Error("The stream '" + this + "' has already been used.")
                ;((this.isLocked = !0), this.previous && this.previous.lock())
              },
              toString: function () {
                var a = 'Worker ' + this.name
                return this.previous ? this.previous + ' -> ' + a : a
              },
            }),
              (n.exports = s))
          },
          {},
        ],
        29: [
          function (r, n, i) {
            var s = r('../utils'),
              a = r('./ConvertWorker'),
              o = r('./GenericWorker'),
              l = r('../base64'),
              p = r('../support'),
              g = r('../external'),
              v = null
            if (p.nodestream)
              try {
                v = r('../nodejs/NodejsStreamOutputAdapter')
              } catch {}
            function E(x, b) {
              return new g.Promise(function (T, m) {
                var A = [],
                  I = x._internalType,
                  D = x._outputType,
                  L = x._mimeType
                x.on('data', function (q, K) {
                  ;(A.push(q), b && b(K))
                })
                  .on('error', function (q) {
                    ;((A = []), m(q))
                  })
                  .on('end', function () {
                    try {
                      var q = (function (K, J, R) {
                        switch (K) {
                          case 'blob':
                            return s.newBlob(s.transformTo('arraybuffer', J), R)
                          case 'base64':
                            return l.encode(J)
                          default:
                            return s.transformTo(K, J)
                        }
                      })(
                        D,
                        (function (K, J) {
                          var R,
                            oe = 0,
                            he = null,
                            F = 0
                          for (R = 0; R < J.length; R++) F += J[R].length
                          switch (K) {
                            case 'string':
                              return J.join('')
                            case 'array':
                              return Array.prototype.concat.apply([], J)
                            case 'uint8array':
                              for (he = new Uint8Array(F), R = 0; R < J.length; R++)
                                (he.set(J[R], oe), (oe += J[R].length))
                              return he
                            case 'nodebuffer':
                              return Buffer.concat(J)
                            default:
                              throw new Error("concat : unsupported type '" + K + "'")
                          }
                        })(I, A),
                        L,
                      )
                      T(q)
                    } catch (K) {
                      m(K)
                    }
                    A = []
                  })
                  .resume()
              })
            }
            function d(x, b, T) {
              var m = b
              switch (b) {
                case 'blob':
                case 'arraybuffer':
                  m = 'uint8array'
                  break
                case 'base64':
                  m = 'string'
              }
              try {
                ;((this._internalType = m),
                  (this._outputType = b),
                  (this._mimeType = T),
                  s.checkSupport(m),
                  (this._worker = x.pipe(new a(m))),
                  x.lock())
              } catch (A) {
                ;((this._worker = new o('error')), this._worker.error(A))
              }
            }
            ;((d.prototype = {
              accumulate: function (x) {
                return E(this, x)
              },
              on: function (x, b) {
                var T = this
                return (
                  x === 'data'
                    ? this._worker.on(x, function (m) {
                        b.call(T, m.data, m.meta)
                      })
                    : this._worker.on(x, function () {
                        s.delay(b, arguments, T)
                      }),
                  this
                )
              },
              resume: function () {
                return (s.delay(this._worker.resume, [], this._worker), this)
              },
              pause: function () {
                return (this._worker.pause(), this)
              },
              toNodejsStream: function (x) {
                if ((s.checkSupport('nodestream'), this._outputType !== 'nodebuffer'))
                  throw new Error(this._outputType + ' is not supported by this method')
                return new v(this, { objectMode: this._outputType !== 'nodebuffer' }, x)
              },
            }),
              (n.exports = d))
          },
          {
            '../base64': 1,
            '../external': 6,
            '../nodejs/NodejsStreamOutputAdapter': 13,
            '../support': 30,
            '../utils': 32,
            './ConvertWorker': 24,
            './GenericWorker': 28,
          },
        ],
        30: [
          function (r, n, i) {
            if (
              ((i.base64 = !0),
              (i.array = !0),
              (i.string = !0),
              (i.arraybuffer = typeof ArrayBuffer < 'u' && typeof Uint8Array < 'u'),
              (i.nodebuffer = typeof Buffer < 'u'),
              (i.uint8array = typeof Uint8Array < 'u'),
              typeof ArrayBuffer > 'u')
            )
              i.blob = !1
            else {
              var s = new ArrayBuffer(0)
              try {
                i.blob = new Blob([s], { type: 'application/zip' }).size === 0
              } catch {
                try {
                  var a = new (
                    self.BlobBuilder ||
                    self.WebKitBlobBuilder ||
                    self.MozBlobBuilder ||
                    self.MSBlobBuilder
                  )()
                  ;(a.append(s), (i.blob = a.getBlob('application/zip').size === 0))
                } catch {
                  i.blob = !1
                }
              }
            }
            try {
              i.nodestream = !!r('readable-stream').Readable
            } catch {
              i.nodestream = !1
            }
          },
          { 'readable-stream': 16 },
        ],
        31: [
          function (r, n, i) {
            for (
              var s = r('./utils'),
                a = r('./support'),
                o = r('./nodejsUtils'),
                l = r('./stream/GenericWorker'),
                p = new Array(256),
                g = 0;
              g < 256;
              g++
            )
              p[g] = 252 <= g ? 6 : 248 <= g ? 5 : 240 <= g ? 4 : 224 <= g ? 3 : 192 <= g ? 2 : 1
            p[254] = p[254] = 1
            function v() {
              ;(l.call(this, 'utf-8 decode'), (this.leftOver = null))
            }
            function E() {
              l.call(this, 'utf-8 encode')
            }
            ;((i.utf8encode = function (d) {
              return a.nodebuffer
                ? o.newBufferFrom(d, 'utf-8')
                : (function (x) {
                    var b,
                      T,
                      m,
                      A,
                      I,
                      D = x.length,
                      L = 0
                    for (A = 0; A < D; A++)
                      ((64512 & (T = x.charCodeAt(A))) == 55296 &&
                        A + 1 < D &&
                        (64512 & (m = x.charCodeAt(A + 1))) == 56320 &&
                        ((T = 65536 + ((T - 55296) << 10) + (m - 56320)), A++),
                        (L += T < 128 ? 1 : T < 2048 ? 2 : T < 65536 ? 3 : 4))
                    for (b = a.uint8array ? new Uint8Array(L) : new Array(L), A = I = 0; I < L; A++)
                      ((64512 & (T = x.charCodeAt(A))) == 55296 &&
                        A + 1 < D &&
                        (64512 & (m = x.charCodeAt(A + 1))) == 56320 &&
                        ((T = 65536 + ((T - 55296) << 10) + (m - 56320)), A++),
                        T < 128
                          ? (b[I++] = T)
                          : (T < 2048
                              ? (b[I++] = 192 | (T >>> 6))
                              : (T < 65536
                                  ? (b[I++] = 224 | (T >>> 12))
                                  : ((b[I++] = 240 | (T >>> 18)),
                                    (b[I++] = 128 | ((T >>> 12) & 63))),
                                (b[I++] = 128 | ((T >>> 6) & 63))),
                            (b[I++] = 128 | (63 & T))))
                    return b
                  })(d)
            }),
              (i.utf8decode = function (d) {
                return a.nodebuffer
                  ? s.transformTo('nodebuffer', d).toString('utf-8')
                  : (function (x) {
                      var b,
                        T,
                        m,
                        A,
                        I = x.length,
                        D = new Array(2 * I)
                      for (b = T = 0; b < I; )
                        if ((m = x[b++]) < 128) D[T++] = m
                        else if (4 < (A = p[m])) ((D[T++] = 65533), (b += A - 1))
                        else {
                          for (m &= A === 2 ? 31 : A === 3 ? 15 : 7; 1 < A && b < I; )
                            ((m = (m << 6) | (63 & x[b++])), A--)
                          1 < A
                            ? (D[T++] = 65533)
                            : m < 65536
                              ? (D[T++] = m)
                              : ((m -= 65536),
                                (D[T++] = 55296 | ((m >> 10) & 1023)),
                                (D[T++] = 56320 | (1023 & m)))
                        }
                      return (
                        D.length !== T && (D.subarray ? (D = D.subarray(0, T)) : (D.length = T)),
                        s.applyFromCharCode(D)
                      )
                    })((d = s.transformTo(a.uint8array ? 'uint8array' : 'array', d)))
              }),
              s.inherits(v, l),
              (v.prototype.processChunk = function (d) {
                var x = s.transformTo(a.uint8array ? 'uint8array' : 'array', d.data)
                if (this.leftOver && this.leftOver.length) {
                  if (a.uint8array) {
                    var b = x
                    ;((x = new Uint8Array(b.length + this.leftOver.length)).set(this.leftOver, 0),
                      x.set(b, this.leftOver.length))
                  } else x = this.leftOver.concat(x)
                  this.leftOver = null
                }
                var T = (function (A, I) {
                    var D
                    for (
                      (I = I || A.length) > A.length && (I = A.length), D = I - 1;
                      0 <= D && (192 & A[D]) == 128;
                    )
                      D--
                    return D < 0 || D === 0 ? I : D + p[A[D]] > I ? D : I
                  })(x),
                  m = x
                ;(T !== x.length &&
                  (a.uint8array
                    ? ((m = x.subarray(0, T)), (this.leftOver = x.subarray(T, x.length)))
                    : ((m = x.slice(0, T)), (this.leftOver = x.slice(T, x.length)))),
                  this.push({ data: i.utf8decode(m), meta: d.meta }))
              }),
              (v.prototype.flush = function () {
                this.leftOver &&
                  this.leftOver.length &&
                  (this.push({ data: i.utf8decode(this.leftOver), meta: {} }),
                  (this.leftOver = null))
              }),
              (i.Utf8DecodeWorker = v),
              s.inherits(E, l),
              (E.prototype.processChunk = function (d) {
                this.push({ data: i.utf8encode(d.data), meta: d.meta })
              }),
              (i.Utf8EncodeWorker = E))
          },
          { './nodejsUtils': 14, './stream/GenericWorker': 28, './support': 30, './utils': 32 },
        ],
        32: [
          function (r, n, i) {
            var s = r('./support'),
              a = r('./base64'),
              o = r('./nodejsUtils'),
              l = r('./external')
            function p(b) {
              return b
            }
            function g(b, T) {
              for (var m = 0; m < b.length; ++m) T[m] = 255 & b.charCodeAt(m)
              return T
            }
            ;(r('setimmediate'),
              (i.newBlob = function (b, T) {
                i.checkSupport('blob')
                try {
                  return new Blob([b], { type: T })
                } catch {
                  try {
                    var m = new (
                      self.BlobBuilder ||
                      self.WebKitBlobBuilder ||
                      self.MozBlobBuilder ||
                      self.MSBlobBuilder
                    )()
                    return (m.append(b), m.getBlob(T))
                  } catch {
                    throw new Error("Bug : can't construct the Blob.")
                  }
                }
              }))
            var v = {
              stringifyByChunk: function (b, T, m) {
                var A = [],
                  I = 0,
                  D = b.length
                if (D <= m) return String.fromCharCode.apply(null, b)
                for (; I < D; )
                  (T === 'array' || T === 'nodebuffer'
                    ? A.push(String.fromCharCode.apply(null, b.slice(I, Math.min(I + m, D))))
                    : A.push(String.fromCharCode.apply(null, b.subarray(I, Math.min(I + m, D)))),
                    (I += m))
                return A.join('')
              },
              stringifyByChar: function (b) {
                for (var T = '', m = 0; m < b.length; m++) T += String.fromCharCode(b[m])
                return T
              },
              applyCanBeUsed: {
                uint8array: (function () {
                  try {
                    return (
                      s.uint8array &&
                      String.fromCharCode.apply(null, new Uint8Array(1)).length === 1
                    )
                  } catch {
                    return !1
                  }
                })(),
                nodebuffer: (function () {
                  try {
                    return (
                      s.nodebuffer && String.fromCharCode.apply(null, o.allocBuffer(1)).length === 1
                    )
                  } catch {
                    return !1
                  }
                })(),
              },
            }
            function E(b) {
              var T = 65536,
                m = i.getTypeOf(b),
                A = !0
              if (
                (m === 'uint8array'
                  ? (A = v.applyCanBeUsed.uint8array)
                  : m === 'nodebuffer' && (A = v.applyCanBeUsed.nodebuffer),
                A)
              )
                for (; 1 < T; )
                  try {
                    return v.stringifyByChunk(b, m, T)
                  } catch {
                    T = Math.floor(T / 2)
                  }
              return v.stringifyByChar(b)
            }
            function d(b, T) {
              for (var m = 0; m < b.length; m++) T[m] = b[m]
              return T
            }
            i.applyFromCharCode = E
            var x = {}
            ;((x.string = {
              string: p,
              array: function (b) {
                return g(b, new Array(b.length))
              },
              arraybuffer: function (b) {
                return x.string.uint8array(b).buffer
              },
              uint8array: function (b) {
                return g(b, new Uint8Array(b.length))
              },
              nodebuffer: function (b) {
                return g(b, o.allocBuffer(b.length))
              },
            }),
              (x.array = {
                string: E,
                array: p,
                arraybuffer: function (b) {
                  return new Uint8Array(b).buffer
                },
                uint8array: function (b) {
                  return new Uint8Array(b)
                },
                nodebuffer: function (b) {
                  return o.newBufferFrom(b)
                },
              }),
              (x.arraybuffer = {
                string: function (b) {
                  return E(new Uint8Array(b))
                },
                array: function (b) {
                  return d(new Uint8Array(b), new Array(b.byteLength))
                },
                arraybuffer: p,
                uint8array: function (b) {
                  return new Uint8Array(b)
                },
                nodebuffer: function (b) {
                  return o.newBufferFrom(new Uint8Array(b))
                },
              }),
              (x.uint8array = {
                string: E,
                array: function (b) {
                  return d(b, new Array(b.length))
                },
                arraybuffer: function (b) {
                  return b.buffer
                },
                uint8array: p,
                nodebuffer: function (b) {
                  return o.newBufferFrom(b)
                },
              }),
              (x.nodebuffer = {
                string: E,
                array: function (b) {
                  return d(b, new Array(b.length))
                },
                arraybuffer: function (b) {
                  return x.nodebuffer.uint8array(b).buffer
                },
                uint8array: function (b) {
                  return d(b, new Uint8Array(b.length))
                },
                nodebuffer: p,
              }),
              (i.transformTo = function (b, T) {
                if (((T = T || ''), !b)) return T
                i.checkSupport(b)
                var m = i.getTypeOf(T)
                return x[m][b](T)
              }),
              (i.resolve = function (b) {
                for (var T = b.split('/'), m = [], A = 0; A < T.length; A++) {
                  var I = T[A]
                  I === '.' ||
                    (I === '' && A !== 0 && A !== T.length - 1) ||
                    (I === '..' ? m.pop() : m.push(I))
                }
                return m.join('/')
              }),
              (i.getTypeOf = function (b) {
                return typeof b == 'string'
                  ? 'string'
                  : Object.prototype.toString.call(b) === '[object Array]'
                    ? 'array'
                    : s.nodebuffer && o.isBuffer(b)
                      ? 'nodebuffer'
                      : s.uint8array && b instanceof Uint8Array
                        ? 'uint8array'
                        : s.arraybuffer && b instanceof ArrayBuffer
                          ? 'arraybuffer'
                          : void 0
              }),
              (i.checkSupport = function (b) {
                if (!s[b.toLowerCase()]) throw new Error(b + ' is not supported by this platform')
              }),
              (i.MAX_VALUE_16BITS = 65535),
              (i.MAX_VALUE_32BITS = -1),
              (i.pretty = function (b) {
                var T,
                  m,
                  A = ''
                for (m = 0; m < (b || '').length; m++)
                  A +=
                    '\\x' + ((T = b.charCodeAt(m)) < 16 ? '0' : '') + T.toString(16).toUpperCase()
                return A
              }),
              (i.delay = function (b, T, m) {
                setImmediate(function () {
                  b.apply(m || null, T || [])
                })
              }),
              (i.inherits = function (b, T) {
                function m() {}
                ;((m.prototype = T.prototype), (b.prototype = new m()))
              }),
              (i.extend = function () {
                var b,
                  T,
                  m = {}
                for (b = 0; b < arguments.length; b++)
                  for (T in arguments[b])
                    Object.prototype.hasOwnProperty.call(arguments[b], T) &&
                      m[T] === void 0 &&
                      (m[T] = arguments[b][T])
                return m
              }),
              (i.prepareContent = function (b, T, m, A, I) {
                return l.Promise.resolve(T)
                  .then(function (D) {
                    return s.blob &&
                      (D instanceof Blob ||
                        ['[object File]', '[object Blob]'].indexOf(
                          Object.prototype.toString.call(D),
                        ) !== -1) &&
                      typeof FileReader < 'u'
                      ? new l.Promise(function (L, q) {
                          var K = new FileReader()
                          ;((K.onload = function (J) {
                            L(J.target.result)
                          }),
                            (K.onerror = function (J) {
                              q(J.target.error)
                            }),
                            K.readAsArrayBuffer(D))
                        })
                      : D
                  })
                  .then(function (D) {
                    var L = i.getTypeOf(D)
                    return L
                      ? (L === 'arraybuffer'
                          ? (D = i.transformTo('uint8array', D))
                          : L === 'string' &&
                            (I
                              ? (D = a.decode(D))
                              : m &&
                                A !== !0 &&
                                (D = (function (q) {
                                  return g(
                                    q,
                                    s.uint8array ? new Uint8Array(q.length) : new Array(q.length),
                                  )
                                })(D))),
                        D)
                      : l.Promise.reject(
                          new Error(
                            "Can't read the data of '" +
                              b +
                              "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?",
                          ),
                        )
                  })
              }))
          },
          {
            './base64': 1,
            './external': 6,
            './nodejsUtils': 14,
            './support': 30,
            setimmediate: 54,
          },
        ],
        33: [
          function (r, n, i) {
            var s = r('./reader/readerFor'),
              a = r('./utils'),
              o = r('./signature'),
              l = r('./zipEntry'),
              p = r('./support')
            function g(v) {
              ;((this.files = []), (this.loadOptions = v))
            }
            ;((g.prototype = {
              checkSignature: function (v) {
                if (!this.reader.readAndCheckSignature(v)) {
                  this.reader.index -= 4
                  var E = this.reader.readString(4)
                  throw new Error(
                    'Corrupted zip or bug: unexpected signature (' +
                      a.pretty(E) +
                      ', expected ' +
                      a.pretty(v) +
                      ')',
                  )
                }
              },
              isSignature: function (v, E) {
                var d = this.reader.index
                this.reader.setIndex(v)
                var x = this.reader.readString(4) === E
                return (this.reader.setIndex(d), x)
              },
              readBlockEndOfCentral: function () {
                ;((this.diskNumber = this.reader.readInt(2)),
                  (this.diskWithCentralDirStart = this.reader.readInt(2)),
                  (this.centralDirRecordsOnThisDisk = this.reader.readInt(2)),
                  (this.centralDirRecords = this.reader.readInt(2)),
                  (this.centralDirSize = this.reader.readInt(4)),
                  (this.centralDirOffset = this.reader.readInt(4)),
                  (this.zipCommentLength = this.reader.readInt(2)))
                var v = this.reader.readData(this.zipCommentLength),
                  E = p.uint8array ? 'uint8array' : 'array',
                  d = a.transformTo(E, v)
                this.zipComment = this.loadOptions.decodeFileName(d)
              },
              readBlockZip64EndOfCentral: function () {
                ;((this.zip64EndOfCentralSize = this.reader.readInt(8)),
                  this.reader.skip(4),
                  (this.diskNumber = this.reader.readInt(4)),
                  (this.diskWithCentralDirStart = this.reader.readInt(4)),
                  (this.centralDirRecordsOnThisDisk = this.reader.readInt(8)),
                  (this.centralDirRecords = this.reader.readInt(8)),
                  (this.centralDirSize = this.reader.readInt(8)),
                  (this.centralDirOffset = this.reader.readInt(8)),
                  (this.zip64ExtensibleData = {}))
                for (var v, E, d, x = this.zip64EndOfCentralSize - 44; 0 < x; )
                  ((v = this.reader.readInt(2)),
                    (E = this.reader.readInt(4)),
                    (d = this.reader.readData(E)),
                    (this.zip64ExtensibleData[v] = { id: v, length: E, value: d }))
              },
              readBlockZip64EndOfCentralLocator: function () {
                if (
                  ((this.diskWithZip64CentralDirStart = this.reader.readInt(4)),
                  (this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8)),
                  (this.disksCount = this.reader.readInt(4)),
                  1 < this.disksCount)
                )
                  throw new Error('Multi-volumes zip are not supported')
              },
              readLocalFiles: function () {
                var v, E
                for (v = 0; v < this.files.length; v++)
                  ((E = this.files[v]),
                    this.reader.setIndex(E.localHeaderOffset),
                    this.checkSignature(o.LOCAL_FILE_HEADER),
                    E.readLocalPart(this.reader),
                    E.handleUTF8(),
                    E.processAttributes())
              },
              readCentralDir: function () {
                var v
                for (
                  this.reader.setIndex(this.centralDirOffset);
                  this.reader.readAndCheckSignature(o.CENTRAL_FILE_HEADER);
                )
                  ((v = new l({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(
                    this.reader,
                  ),
                    this.files.push(v))
                if (
                  this.centralDirRecords !== this.files.length &&
                  this.centralDirRecords !== 0 &&
                  this.files.length === 0
                )
                  throw new Error(
                    'Corrupted zip or bug: expected ' +
                      this.centralDirRecords +
                      ' records in central dir, got ' +
                      this.files.length,
                  )
              },
              readEndOfCentral: function () {
                var v = this.reader.lastIndexOfSignature(o.CENTRAL_DIRECTORY_END)
                if (v < 0)
                  throw this.isSignature(0, o.LOCAL_FILE_HEADER)
                    ? new Error("Corrupted zip: can't find end of central directory")
                    : new Error(
                        "Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html",
                      )
                this.reader.setIndex(v)
                var E = v
                if (
                  (this.checkSignature(o.CENTRAL_DIRECTORY_END),
                  this.readBlockEndOfCentral(),
                  this.diskNumber === a.MAX_VALUE_16BITS ||
                    this.diskWithCentralDirStart === a.MAX_VALUE_16BITS ||
                    this.centralDirRecordsOnThisDisk === a.MAX_VALUE_16BITS ||
                    this.centralDirRecords === a.MAX_VALUE_16BITS ||
                    this.centralDirSize === a.MAX_VALUE_32BITS ||
                    this.centralDirOffset === a.MAX_VALUE_32BITS)
                ) {
                  if (
                    ((this.zip64 = !0),
                    (v = this.reader.lastIndexOfSignature(o.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0)
                  )
                    throw new Error(
                      "Corrupted zip: can't find the ZIP64 end of central directory locator",
                    )
                  if (
                    (this.reader.setIndex(v),
                    this.checkSignature(o.ZIP64_CENTRAL_DIRECTORY_LOCATOR),
                    this.readBlockZip64EndOfCentralLocator(),
                    !this.isSignature(
                      this.relativeOffsetEndOfZip64CentralDir,
                      o.ZIP64_CENTRAL_DIRECTORY_END,
                    ) &&
                      ((this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(
                        o.ZIP64_CENTRAL_DIRECTORY_END,
                      )),
                      this.relativeOffsetEndOfZip64CentralDir < 0))
                  )
                    throw new Error("Corrupted zip: can't find the ZIP64 end of central directory")
                  ;(this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),
                    this.checkSignature(o.ZIP64_CENTRAL_DIRECTORY_END),
                    this.readBlockZip64EndOfCentral())
                }
                var d = this.centralDirOffset + this.centralDirSize
                this.zip64 && ((d += 20), (d += 12 + this.zip64EndOfCentralSize))
                var x = E - d
                if (0 < x) this.isSignature(E, o.CENTRAL_FILE_HEADER) || (this.reader.zero = x)
                else if (x < 0) throw new Error('Corrupted zip: missing ' + Math.abs(x) + ' bytes.')
              },
              prepareReader: function (v) {
                this.reader = s(v)
              },
              load: function (v) {
                ;(this.prepareReader(v),
                  this.readEndOfCentral(),
                  this.readCentralDir(),
                  this.readLocalFiles())
              },
            }),
              (n.exports = g))
          },
          {
            './reader/readerFor': 22,
            './signature': 23,
            './support': 30,
            './utils': 32,
            './zipEntry': 34,
          },
        ],
        34: [
          function (r, n, i) {
            var s = r('./reader/readerFor'),
              a = r('./utils'),
              o = r('./compressedObject'),
              l = r('./crc32'),
              p = r('./utf8'),
              g = r('./compressions'),
              v = r('./support')
            function E(d, x) {
              ;((this.options = d), (this.loadOptions = x))
            }
            ;((E.prototype = {
              isEncrypted: function () {
                return (1 & this.bitFlag) == 1
              },
              useUTF8: function () {
                return (2048 & this.bitFlag) == 2048
              },
              readLocalPart: function (d) {
                var x, b
                if (
                  (d.skip(22),
                  (this.fileNameLength = d.readInt(2)),
                  (b = d.readInt(2)),
                  (this.fileName = d.readData(this.fileNameLength)),
                  d.skip(b),
                  this.compressedSize === -1 || this.uncompressedSize === -1)
                )
                  throw new Error(
                    "Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)",
                  )
                if (
                  (x = (function (T) {
                    for (var m in g)
                      if (Object.prototype.hasOwnProperty.call(g, m) && g[m].magic === T)
                        return g[m]
                    return null
                  })(this.compressionMethod)) === null
                )
                  throw new Error(
                    'Corrupted zip : compression ' +
                      a.pretty(this.compressionMethod) +
                      ' unknown (inner file : ' +
                      a.transformTo('string', this.fileName) +
                      ')',
                  )
                this.decompressed = new o(
                  this.compressedSize,
                  this.uncompressedSize,
                  this.crc32,
                  x,
                  d.readData(this.compressedSize),
                )
              },
              readCentralPart: function (d) {
                ;((this.versionMadeBy = d.readInt(2)),
                  d.skip(2),
                  (this.bitFlag = d.readInt(2)),
                  (this.compressionMethod = d.readString(2)),
                  (this.date = d.readDate()),
                  (this.crc32 = d.readInt(4)),
                  (this.compressedSize = d.readInt(4)),
                  (this.uncompressedSize = d.readInt(4)))
                var x = d.readInt(2)
                if (
                  ((this.extraFieldsLength = d.readInt(2)),
                  (this.fileCommentLength = d.readInt(2)),
                  (this.diskNumberStart = d.readInt(2)),
                  (this.internalFileAttributes = d.readInt(2)),
                  (this.externalFileAttributes = d.readInt(4)),
                  (this.localHeaderOffset = d.readInt(4)),
                  this.isEncrypted())
                )
                  throw new Error('Encrypted zip are not supported')
                ;(d.skip(x),
                  this.readExtraFields(d),
                  this.parseZIP64ExtraField(d),
                  (this.fileComment = d.readData(this.fileCommentLength)))
              },
              processAttributes: function () {
                ;((this.unixPermissions = null), (this.dosPermissions = null))
                var d = this.versionMadeBy >> 8
                ;((this.dir = !!(16 & this.externalFileAttributes)),
                  d == 0 && (this.dosPermissions = 63 & this.externalFileAttributes),
                  d == 3 && (this.unixPermissions = (this.externalFileAttributes >> 16) & 65535),
                  this.dir || this.fileNameStr.slice(-1) !== '/' || (this.dir = !0))
              },
              parseZIP64ExtraField: function () {
                if (this.extraFields[1]) {
                  var d = s(this.extraFields[1].value)
                  ;(this.uncompressedSize === a.MAX_VALUE_32BITS &&
                    (this.uncompressedSize = d.readInt(8)),
                    this.compressedSize === a.MAX_VALUE_32BITS &&
                      (this.compressedSize = d.readInt(8)),
                    this.localHeaderOffset === a.MAX_VALUE_32BITS &&
                      (this.localHeaderOffset = d.readInt(8)),
                    this.diskNumberStart === a.MAX_VALUE_32BITS &&
                      (this.diskNumberStart = d.readInt(4)))
                }
              },
              readExtraFields: function (d) {
                var x,
                  b,
                  T,
                  m = d.index + this.extraFieldsLength
                for (this.extraFields || (this.extraFields = {}); d.index + 4 < m; )
                  ((x = d.readInt(2)),
                    (b = d.readInt(2)),
                    (T = d.readData(b)),
                    (this.extraFields[x] = { id: x, length: b, value: T }))
                d.setIndex(m)
              },
              handleUTF8: function () {
                var d = v.uint8array ? 'uint8array' : 'array'
                if (this.useUTF8())
                  ((this.fileNameStr = p.utf8decode(this.fileName)),
                    (this.fileCommentStr = p.utf8decode(this.fileComment)))
                else {
                  var x = this.findExtraFieldUnicodePath()
                  if (x !== null) this.fileNameStr = x
                  else {
                    var b = a.transformTo(d, this.fileName)
                    this.fileNameStr = this.loadOptions.decodeFileName(b)
                  }
                  var T = this.findExtraFieldUnicodeComment()
                  if (T !== null) this.fileCommentStr = T
                  else {
                    var m = a.transformTo(d, this.fileComment)
                    this.fileCommentStr = this.loadOptions.decodeFileName(m)
                  }
                }
              },
              findExtraFieldUnicodePath: function () {
                var d = this.extraFields[28789]
                if (d) {
                  var x = s(d.value)
                  return x.readInt(1) !== 1 || l(this.fileName) !== x.readInt(4)
                    ? null
                    : p.utf8decode(x.readData(d.length - 5))
                }
                return null
              },
              findExtraFieldUnicodeComment: function () {
                var d = this.extraFields[25461]
                if (d) {
                  var x = s(d.value)
                  return x.readInt(1) !== 1 || l(this.fileComment) !== x.readInt(4)
                    ? null
                    : p.utf8decode(x.readData(d.length - 5))
                }
                return null
              },
            }),
              (n.exports = E))
          },
          {
            './compressedObject': 2,
            './compressions': 3,
            './crc32': 4,
            './reader/readerFor': 22,
            './support': 30,
            './utf8': 31,
            './utils': 32,
          },
        ],
        35: [
          function (r, n, i) {
            function s(x, b, T) {
              ;((this.name = x),
                (this.dir = T.dir),
                (this.date = T.date),
                (this.comment = T.comment),
                (this.unixPermissions = T.unixPermissions),
                (this.dosPermissions = T.dosPermissions),
                (this._data = b),
                (this._dataBinary = T.binary),
                (this.options = {
                  compression: T.compression,
                  compressionOptions: T.compressionOptions,
                }))
            }
            var a = r('./stream/StreamHelper'),
              o = r('./stream/DataWorker'),
              l = r('./utf8'),
              p = r('./compressedObject'),
              g = r('./stream/GenericWorker')
            s.prototype = {
              internalStream: function (x) {
                var b = null,
                  T = 'string'
                try {
                  if (!x) throw new Error('No output type specified.')
                  var m = (T = x.toLowerCase()) === 'string' || T === 'text'
                  ;((T !== 'binarystring' && T !== 'text') || (T = 'string'),
                    (b = this._decompressWorker()))
                  var A = !this._dataBinary
                  ;(A && !m && (b = b.pipe(new l.Utf8EncodeWorker())),
                    !A && m && (b = b.pipe(new l.Utf8DecodeWorker())))
                } catch (I) {
                  ;(b = new g('error')).error(I)
                }
                return new a(b, T, '')
              },
              async: function (x, b) {
                return this.internalStream(x).accumulate(b)
              },
              nodeStream: function (x, b) {
                return this.internalStream(x || 'nodebuffer').toNodejsStream(b)
              },
              _compressWorker: function (x, b) {
                if (this._data instanceof p && this._data.compression.magic === x.magic)
                  return this._data.getCompressedWorker()
                var T = this._decompressWorker()
                return (
                  this._dataBinary || (T = T.pipe(new l.Utf8EncodeWorker())),
                  p.createWorkerFrom(T, x, b)
                )
              },
              _decompressWorker: function () {
                return this._data instanceof p
                  ? this._data.getContentWorker()
                  : this._data instanceof g
                    ? this._data
                    : new o(this._data)
              },
            }
            for (
              var v = ['asText', 'asBinary', 'asNodeBuffer', 'asUint8Array', 'asArrayBuffer'],
                E = function () {
                  throw new Error(
                    'This method has been removed in JSZip 3.0, please check the upgrade guide.',
                  )
                },
                d = 0;
              d < v.length;
              d++
            )
              s.prototype[v[d]] = E
            n.exports = s
          },
          {
            './compressedObject': 2,
            './stream/DataWorker': 27,
            './stream/GenericWorker': 28,
            './stream/StreamHelper': 29,
            './utf8': 31,
          },
        ],
        36: [
          function (r, n, i) {
            ;(function (s) {
              var a,
                o,
                l = s.MutationObserver || s.WebKitMutationObserver
              if (l) {
                var p = 0,
                  g = new l(x),
                  v = s.document.createTextNode('')
                ;(g.observe(v, { characterData: !0 }),
                  (a = function () {
                    v.data = p = ++p % 2
                  }))
              } else if (s.setImmediate || s.MessageChannel === void 0)
                a =
                  'document' in s && 'onreadystatechange' in s.document.createElement('script')
                    ? function () {
                        var b = s.document.createElement('script')
                        ;((b.onreadystatechange = function () {
                          ;(x(),
                            (b.onreadystatechange = null),
                            b.parentNode.removeChild(b),
                            (b = null))
                        }),
                          s.document.documentElement.appendChild(b))
                      }
                    : function () {
                        setTimeout(x, 0)
                      }
              else {
                var E = new s.MessageChannel()
                ;((E.port1.onmessage = x),
                  (a = function () {
                    E.port2.postMessage(0)
                  }))
              }
              var d = []
              function x() {
                var b, T
                o = !0
                for (var m = d.length; m; ) {
                  for (T = d, d = [], b = -1; ++b < m; ) T[b]()
                  m = d.length
                }
                o = !1
              }
              n.exports = function (b) {
                d.push(b) !== 1 || o || a()
              }
            }).call(
              this,
              typeof ct < 'u' ? ct : typeof self < 'u' ? self : typeof window < 'u' ? window : {},
            )
          },
          {},
        ],
        37: [
          function (r, n, i) {
            var s = r('immediate')
            function a() {}
            var o = {},
              l = ['REJECTED'],
              p = ['FULFILLED'],
              g = ['PENDING']
            function v(m) {
              if (typeof m != 'function') throw new TypeError('resolver must be a function')
              ;((this.state = g), (this.queue = []), (this.outcome = void 0), m !== a && b(this, m))
            }
            function E(m, A, I) {
              ;((this.promise = m),
                typeof A == 'function' &&
                  ((this.onFulfilled = A), (this.callFulfilled = this.otherCallFulfilled)),
                typeof I == 'function' &&
                  ((this.onRejected = I), (this.callRejected = this.otherCallRejected)))
            }
            function d(m, A, I) {
              s(function () {
                var D
                try {
                  D = A(I)
                } catch (L) {
                  return o.reject(m, L)
                }
                D === m
                  ? o.reject(m, new TypeError('Cannot resolve promise with itself'))
                  : o.resolve(m, D)
              })
            }
            function x(m) {
              var A = m && m.then
              if (m && (typeof m == 'object' || typeof m == 'function') && typeof A == 'function')
                return function () {
                  A.apply(m, arguments)
                }
            }
            function b(m, A) {
              var I = !1
              function D(K) {
                I || ((I = !0), o.reject(m, K))
              }
              function L(K) {
                I || ((I = !0), o.resolve(m, K))
              }
              var q = T(function () {
                A(L, D)
              })
              q.status === 'error' && D(q.value)
            }
            function T(m, A) {
              var I = {}
              try {
                ;((I.value = m(A)), (I.status = 'success'))
              } catch (D) {
                ;((I.status = 'error'), (I.value = D))
              }
              return I
            }
            ;(((n.exports = v).prototype.finally = function (m) {
              if (typeof m != 'function') return this
              var A = this.constructor
              return this.then(
                function (I) {
                  return A.resolve(m()).then(function () {
                    return I
                  })
                },
                function (I) {
                  return A.resolve(m()).then(function () {
                    throw I
                  })
                },
              )
            }),
              (v.prototype.catch = function (m) {
                return this.then(null, m)
              }),
              (v.prototype.then = function (m, A) {
                if (
                  (typeof m != 'function' && this.state === p) ||
                  (typeof A != 'function' && this.state === l)
                )
                  return this
                var I = new this.constructor(a)
                return (
                  this.state !== g
                    ? d(I, this.state === p ? m : A, this.outcome)
                    : this.queue.push(new E(I, m, A)),
                  I
                )
              }),
              (E.prototype.callFulfilled = function (m) {
                o.resolve(this.promise, m)
              }),
              (E.prototype.otherCallFulfilled = function (m) {
                d(this.promise, this.onFulfilled, m)
              }),
              (E.prototype.callRejected = function (m) {
                o.reject(this.promise, m)
              }),
              (E.prototype.otherCallRejected = function (m) {
                d(this.promise, this.onRejected, m)
              }),
              (o.resolve = function (m, A) {
                var I = T(x, A)
                if (I.status === 'error') return o.reject(m, I.value)
                var D = I.value
                if (D) b(m, D)
                else {
                  ;((m.state = p), (m.outcome = A))
                  for (var L = -1, q = m.queue.length; ++L < q; ) m.queue[L].callFulfilled(A)
                }
                return m
              }),
              (o.reject = function (m, A) {
                ;((m.state = l), (m.outcome = A))
                for (var I = -1, D = m.queue.length; ++I < D; ) m.queue[I].callRejected(A)
                return m
              }),
              (v.resolve = function (m) {
                return m instanceof this ? m : o.resolve(new this(a), m)
              }),
              (v.reject = function (m) {
                var A = new this(a)
                return o.reject(A, m)
              }),
              (v.all = function (m) {
                var A = this
                if (Object.prototype.toString.call(m) !== '[object Array]')
                  return this.reject(new TypeError('must be an array'))
                var I = m.length,
                  D = !1
                if (!I) return this.resolve([])
                for (var L = new Array(I), q = 0, K = -1, J = new this(a); ++K < I; ) R(m[K], K)
                return J
                function R(oe, he) {
                  A.resolve(oe).then(
                    function (F) {
                      ;((L[he] = F), ++q !== I || D || ((D = !0), o.resolve(J, L)))
                    },
                    function (F) {
                      D || ((D = !0), o.reject(J, F))
                    },
                  )
                }
              }),
              (v.race = function (m) {
                var A = this
                if (Object.prototype.toString.call(m) !== '[object Array]')
                  return this.reject(new TypeError('must be an array'))
                var I = m.length,
                  D = !1
                if (!I) return this.resolve([])
                for (var L = -1, q = new this(a); ++L < I; )
                  ((K = m[L]),
                    A.resolve(K).then(
                      function (J) {
                        D || ((D = !0), o.resolve(q, J))
                      },
                      function (J) {
                        D || ((D = !0), o.reject(q, J))
                      },
                    ))
                var K
                return q
              }))
          },
          { immediate: 36 },
        ],
        38: [
          function (r, n, i) {
            var s = {}
            ;((0, r('./lib/utils/common').assign)(
              s,
              r('./lib/deflate'),
              r('./lib/inflate'),
              r('./lib/zlib/constants'),
            ),
              (n.exports = s))
          },
          {
            './lib/deflate': 39,
            './lib/inflate': 40,
            './lib/utils/common': 41,
            './lib/zlib/constants': 44,
          },
        ],
        39: [
          function (r, n, i) {
            var s = r('./zlib/deflate'),
              a = r('./utils/common'),
              o = r('./utils/strings'),
              l = r('./zlib/messages'),
              p = r('./zlib/zstream'),
              g = Object.prototype.toString,
              v = 0,
              E = -1,
              d = 0,
              x = 8
            function b(m) {
              if (!(this instanceof b)) return new b(m)
              this.options = a.assign(
                {
                  level: E,
                  method: x,
                  chunkSize: 16384,
                  windowBits: 15,
                  memLevel: 8,
                  strategy: d,
                  to: '',
                },
                m || {},
              )
              var A = this.options
              ;(A.raw && 0 < A.windowBits
                ? (A.windowBits = -A.windowBits)
                : A.gzip && 0 < A.windowBits && A.windowBits < 16 && (A.windowBits += 16),
                (this.err = 0),
                (this.msg = ''),
                (this.ended = !1),
                (this.chunks = []),
                (this.strm = new p()),
                (this.strm.avail_out = 0))
              var I = s.deflateInit2(
                this.strm,
                A.level,
                A.method,
                A.windowBits,
                A.memLevel,
                A.strategy,
              )
              if (I !== v) throw new Error(l[I])
              if ((A.header && s.deflateSetHeader(this.strm, A.header), A.dictionary)) {
                var D
                if (
                  ((D =
                    typeof A.dictionary == 'string'
                      ? o.string2buf(A.dictionary)
                      : g.call(A.dictionary) === '[object ArrayBuffer]'
                        ? new Uint8Array(A.dictionary)
                        : A.dictionary),
                  (I = s.deflateSetDictionary(this.strm, D)) !== v)
                )
                  throw new Error(l[I])
                this._dict_set = !0
              }
            }
            function T(m, A) {
              var I = new b(A)
              if ((I.push(m, !0), I.err)) throw I.msg || l[I.err]
              return I.result
            }
            ;((b.prototype.push = function (m, A) {
              var I,
                D,
                L = this.strm,
                q = this.options.chunkSize
              if (this.ended) return !1
              ;((D = A === ~~A ? A : A === !0 ? 4 : 0),
                typeof m == 'string'
                  ? (L.input = o.string2buf(m))
                  : g.call(m) === '[object ArrayBuffer]'
                    ? (L.input = new Uint8Array(m))
                    : (L.input = m),
                (L.next_in = 0),
                (L.avail_in = L.input.length))
              do {
                if (
                  (L.avail_out === 0 &&
                    ((L.output = new a.Buf8(q)), (L.next_out = 0), (L.avail_out = q)),
                  (I = s.deflate(L, D)) !== 1 && I !== v)
                )
                  return (this.onEnd(I), !(this.ended = !0))
                ;(L.avail_out !== 0 && (L.avail_in !== 0 || (D !== 4 && D !== 2))) ||
                  (this.options.to === 'string'
                    ? this.onData(o.buf2binstring(a.shrinkBuf(L.output, L.next_out)))
                    : this.onData(a.shrinkBuf(L.output, L.next_out)))
              } while ((0 < L.avail_in || L.avail_out === 0) && I !== 1)
              return D === 4
                ? ((I = s.deflateEnd(this.strm)), this.onEnd(I), (this.ended = !0), I === v)
                : D !== 2 || (this.onEnd(v), !(L.avail_out = 0))
            }),
              (b.prototype.onData = function (m) {
                this.chunks.push(m)
              }),
              (b.prototype.onEnd = function (m) {
                ;(m === v &&
                  (this.options.to === 'string'
                    ? (this.result = this.chunks.join(''))
                    : (this.result = a.flattenChunks(this.chunks))),
                  (this.chunks = []),
                  (this.err = m),
                  (this.msg = this.strm.msg))
              }),
              (i.Deflate = b),
              (i.deflate = T),
              (i.deflateRaw = function (m, A) {
                return (((A = A || {}).raw = !0), T(m, A))
              }),
              (i.gzip = function (m, A) {
                return (((A = A || {}).gzip = !0), T(m, A))
              }))
          },
          {
            './utils/common': 41,
            './utils/strings': 42,
            './zlib/deflate': 46,
            './zlib/messages': 51,
            './zlib/zstream': 53,
          },
        ],
        40: [
          function (r, n, i) {
            var s = r('./zlib/inflate'),
              a = r('./utils/common'),
              o = r('./utils/strings'),
              l = r('./zlib/constants'),
              p = r('./zlib/messages'),
              g = r('./zlib/zstream'),
              v = r('./zlib/gzheader'),
              E = Object.prototype.toString
            function d(b) {
              if (!(this instanceof d)) return new d(b)
              this.options = a.assign({ chunkSize: 16384, windowBits: 0, to: '' }, b || {})
              var T = this.options
              ;(T.raw &&
                0 <= T.windowBits &&
                T.windowBits < 16 &&
                ((T.windowBits = -T.windowBits), T.windowBits === 0 && (T.windowBits = -15)),
                !(0 <= T.windowBits && T.windowBits < 16) ||
                  (b && b.windowBits) ||
                  (T.windowBits += 32),
                15 < T.windowBits &&
                  T.windowBits < 48 &&
                  !(15 & T.windowBits) &&
                  (T.windowBits |= 15),
                (this.err = 0),
                (this.msg = ''),
                (this.ended = !1),
                (this.chunks = []),
                (this.strm = new g()),
                (this.strm.avail_out = 0))
              var m = s.inflateInit2(this.strm, T.windowBits)
              if (m !== l.Z_OK) throw new Error(p[m])
              ;((this.header = new v()), s.inflateGetHeader(this.strm, this.header))
            }
            function x(b, T) {
              var m = new d(T)
              if ((m.push(b, !0), m.err)) throw m.msg || p[m.err]
              return m.result
            }
            ;((d.prototype.push = function (b, T) {
              var m,
                A,
                I,
                D,
                L,
                q,
                K = this.strm,
                J = this.options.chunkSize,
                R = this.options.dictionary,
                oe = !1
              if (this.ended) return !1
              ;((A = T === ~~T ? T : T === !0 ? l.Z_FINISH : l.Z_NO_FLUSH),
                typeof b == 'string'
                  ? (K.input = o.binstring2buf(b))
                  : E.call(b) === '[object ArrayBuffer]'
                    ? (K.input = new Uint8Array(b))
                    : (K.input = b),
                (K.next_in = 0),
                (K.avail_in = K.input.length))
              do {
                if (
                  (K.avail_out === 0 &&
                    ((K.output = new a.Buf8(J)), (K.next_out = 0), (K.avail_out = J)),
                  (m = s.inflate(K, l.Z_NO_FLUSH)) === l.Z_NEED_DICT &&
                    R &&
                    ((q =
                      typeof R == 'string'
                        ? o.string2buf(R)
                        : E.call(R) === '[object ArrayBuffer]'
                          ? new Uint8Array(R)
                          : R),
                    (m = s.inflateSetDictionary(this.strm, q))),
                  m === l.Z_BUF_ERROR && oe === !0 && ((m = l.Z_OK), (oe = !1)),
                  m !== l.Z_STREAM_END && m !== l.Z_OK)
                )
                  return (this.onEnd(m), !(this.ended = !0))
                ;(K.next_out &&
                  ((K.avail_out !== 0 &&
                    m !== l.Z_STREAM_END &&
                    (K.avail_in !== 0 || (A !== l.Z_FINISH && A !== l.Z_SYNC_FLUSH))) ||
                    (this.options.to === 'string'
                      ? ((I = o.utf8border(K.output, K.next_out)),
                        (D = K.next_out - I),
                        (L = o.buf2string(K.output, I)),
                        (K.next_out = D),
                        (K.avail_out = J - D),
                        D && a.arraySet(K.output, K.output, I, D, 0),
                        this.onData(L))
                      : this.onData(a.shrinkBuf(K.output, K.next_out)))),
                  K.avail_in === 0 && K.avail_out === 0 && (oe = !0))
              } while ((0 < K.avail_in || K.avail_out === 0) && m !== l.Z_STREAM_END)
              return (
                m === l.Z_STREAM_END && (A = l.Z_FINISH),
                A === l.Z_FINISH
                  ? ((m = s.inflateEnd(this.strm)), this.onEnd(m), (this.ended = !0), m === l.Z_OK)
                  : A !== l.Z_SYNC_FLUSH || (this.onEnd(l.Z_OK), !(K.avail_out = 0))
              )
            }),
              (d.prototype.onData = function (b) {
                this.chunks.push(b)
              }),
              (d.prototype.onEnd = function (b) {
                ;(b === l.Z_OK &&
                  (this.options.to === 'string'
                    ? (this.result = this.chunks.join(''))
                    : (this.result = a.flattenChunks(this.chunks))),
                  (this.chunks = []),
                  (this.err = b),
                  (this.msg = this.strm.msg))
              }),
              (i.Inflate = d),
              (i.inflate = x),
              (i.inflateRaw = function (b, T) {
                return (((T = T || {}).raw = !0), x(b, T))
              }),
              (i.ungzip = x))
          },
          {
            './utils/common': 41,
            './utils/strings': 42,
            './zlib/constants': 44,
            './zlib/gzheader': 47,
            './zlib/inflate': 49,
            './zlib/messages': 51,
            './zlib/zstream': 53,
          },
        ],
        41: [
          function (r, n, i) {
            var s = typeof Uint8Array < 'u' && typeof Uint16Array < 'u' && typeof Int32Array < 'u'
            ;((i.assign = function (l) {
              for (var p = Array.prototype.slice.call(arguments, 1); p.length; ) {
                var g = p.shift()
                if (g) {
                  if (typeof g != 'object') throw new TypeError(g + 'must be non-object')
                  for (var v in g) g.hasOwnProperty(v) && (l[v] = g[v])
                }
              }
              return l
            }),
              (i.shrinkBuf = function (l, p) {
                return l.length === p ? l : l.subarray ? l.subarray(0, p) : ((l.length = p), l)
              }))
            var a = {
                arraySet: function (l, p, g, v, E) {
                  if (p.subarray && l.subarray) l.set(p.subarray(g, g + v), E)
                  else for (var d = 0; d < v; d++) l[E + d] = p[g + d]
                },
                flattenChunks: function (l) {
                  var p, g, v, E, d, x
                  for (p = v = 0, g = l.length; p < g; p++) v += l[p].length
                  for (x = new Uint8Array(v), p = E = 0, g = l.length; p < g; p++)
                    ((d = l[p]), x.set(d, E), (E += d.length))
                  return x
                },
              },
              o = {
                arraySet: function (l, p, g, v, E) {
                  for (var d = 0; d < v; d++) l[E + d] = p[g + d]
                },
                flattenChunks: function (l) {
                  return [].concat.apply([], l)
                },
              }
            ;((i.setTyped = function (l) {
              l
                ? ((i.Buf8 = Uint8Array),
                  (i.Buf16 = Uint16Array),
                  (i.Buf32 = Int32Array),
                  i.assign(i, a))
                : ((i.Buf8 = Array), (i.Buf16 = Array), (i.Buf32 = Array), i.assign(i, o))
            }),
              i.setTyped(s))
          },
          {},
        ],
        42: [
          function (r, n, i) {
            var s = r('./common'),
              a = !0,
              o = !0
            try {
              String.fromCharCode.apply(null, [0])
            } catch {
              a = !1
            }
            try {
              String.fromCharCode.apply(null, new Uint8Array(1))
            } catch {
              o = !1
            }
            for (var l = new s.Buf8(256), p = 0; p < 256; p++)
              l[p] = 252 <= p ? 6 : 248 <= p ? 5 : 240 <= p ? 4 : 224 <= p ? 3 : 192 <= p ? 2 : 1
            function g(v, E) {
              if (E < 65537 && ((v.subarray && o) || (!v.subarray && a)))
                return String.fromCharCode.apply(null, s.shrinkBuf(v, E))
              for (var d = '', x = 0; x < E; x++) d += String.fromCharCode(v[x])
              return d
            }
            ;((l[254] = l[254] = 1),
              (i.string2buf = function (v) {
                var E,
                  d,
                  x,
                  b,
                  T,
                  m = v.length,
                  A = 0
                for (b = 0; b < m; b++)
                  ((64512 & (d = v.charCodeAt(b))) == 55296 &&
                    b + 1 < m &&
                    (64512 & (x = v.charCodeAt(b + 1))) == 56320 &&
                    ((d = 65536 + ((d - 55296) << 10) + (x - 56320)), b++),
                    (A += d < 128 ? 1 : d < 2048 ? 2 : d < 65536 ? 3 : 4))
                for (E = new s.Buf8(A), b = T = 0; T < A; b++)
                  ((64512 & (d = v.charCodeAt(b))) == 55296 &&
                    b + 1 < m &&
                    (64512 & (x = v.charCodeAt(b + 1))) == 56320 &&
                    ((d = 65536 + ((d - 55296) << 10) + (x - 56320)), b++),
                    d < 128
                      ? (E[T++] = d)
                      : (d < 2048
                          ? (E[T++] = 192 | (d >>> 6))
                          : (d < 65536
                              ? (E[T++] = 224 | (d >>> 12))
                              : ((E[T++] = 240 | (d >>> 18)), (E[T++] = 128 | ((d >>> 12) & 63))),
                            (E[T++] = 128 | ((d >>> 6) & 63))),
                        (E[T++] = 128 | (63 & d))))
                return E
              }),
              (i.buf2binstring = function (v) {
                return g(v, v.length)
              }),
              (i.binstring2buf = function (v) {
                for (var E = new s.Buf8(v.length), d = 0, x = E.length; d < x; d++)
                  E[d] = v.charCodeAt(d)
                return E
              }),
              (i.buf2string = function (v, E) {
                var d,
                  x,
                  b,
                  T,
                  m = E || v.length,
                  A = new Array(2 * m)
                for (d = x = 0; d < m; )
                  if ((b = v[d++]) < 128) A[x++] = b
                  else if (4 < (T = l[b])) ((A[x++] = 65533), (d += T - 1))
                  else {
                    for (b &= T === 2 ? 31 : T === 3 ? 15 : 7; 1 < T && d < m; )
                      ((b = (b << 6) | (63 & v[d++])), T--)
                    1 < T
                      ? (A[x++] = 65533)
                      : b < 65536
                        ? (A[x++] = b)
                        : ((b -= 65536),
                          (A[x++] = 55296 | ((b >> 10) & 1023)),
                          (A[x++] = 56320 | (1023 & b)))
                  }
                return g(A, x)
              }),
              (i.utf8border = function (v, E) {
                var d
                for (
                  (E = E || v.length) > v.length && (E = v.length), d = E - 1;
                  0 <= d && (192 & v[d]) == 128;
                )
                  d--
                return d < 0 || d === 0 ? E : d + l[v[d]] > E ? d : E
              }))
          },
          { './common': 41 },
        ],
        43: [
          function (r, n, i) {
            n.exports = function (s, a, o, l) {
              for (var p = (65535 & s) | 0, g = ((s >>> 16) & 65535) | 0, v = 0; o !== 0; ) {
                for (o -= v = 2e3 < o ? 2e3 : o; (g = (g + (p = (p + a[l++]) | 0)) | 0), --v; );
                ;((p %= 65521), (g %= 65521))
              }
              return p | (g << 16) | 0
            }
          },
          {},
        ],
        44: [
          function (r, n, i) {
            n.exports = {
              Z_NO_FLUSH: 0,
              Z_PARTIAL_FLUSH: 1,
              Z_SYNC_FLUSH: 2,
              Z_FULL_FLUSH: 3,
              Z_FINISH: 4,
              Z_BLOCK: 5,
              Z_TREES: 6,
              Z_OK: 0,
              Z_STREAM_END: 1,
              Z_NEED_DICT: 2,
              Z_ERRNO: -1,
              Z_STREAM_ERROR: -2,
              Z_DATA_ERROR: -3,
              Z_BUF_ERROR: -5,
              Z_NO_COMPRESSION: 0,
              Z_BEST_SPEED: 1,
              Z_BEST_COMPRESSION: 9,
              Z_DEFAULT_COMPRESSION: -1,
              Z_FILTERED: 1,
              Z_HUFFMAN_ONLY: 2,
              Z_RLE: 3,
              Z_FIXED: 4,
              Z_DEFAULT_STRATEGY: 0,
              Z_BINARY: 0,
              Z_TEXT: 1,
              Z_UNKNOWN: 2,
              Z_DEFLATED: 8,
            }
          },
          {},
        ],
        45: [
          function (r, n, i) {
            var s = (function () {
              for (var a, o = [], l = 0; l < 256; l++) {
                a = l
                for (var p = 0; p < 8; p++) a = 1 & a ? 3988292384 ^ (a >>> 1) : a >>> 1
                o[l] = a
              }
              return o
            })()
            n.exports = function (a, o, l, p) {
              var g = s,
                v = p + l
              a ^= -1
              for (var E = p; E < v; E++) a = (a >>> 8) ^ g[255 & (a ^ o[E])]
              return -1 ^ a
            }
          },
          {},
        ],
        46: [
          function (r, n, i) {
            var s,
              a = r('../utils/common'),
              o = r('./trees'),
              l = r('./adler32'),
              p = r('./crc32'),
              g = r('./messages'),
              v = 0,
              E = 4,
              d = 0,
              x = -2,
              b = -1,
              T = 4,
              m = 2,
              A = 8,
              I = 9,
              D = 286,
              L = 30,
              q = 19,
              K = 2 * D + 1,
              J = 15,
              R = 3,
              oe = 258,
              he = oe + R + 1,
              F = 42,
              V = 113,
              S = 1,
              Y = 2,
              le = 3,
              Z = 4
            function pe(f, X) {
              return ((f.msg = g[X]), X)
            }
            function re(f) {
              return (f << 1) - (4 < f ? 9 : 0)
            }
            function de(f) {
              for (var X = f.length; 0 <= --X; ) f[X] = 0
            }
            function j(f) {
              var X = f.state,
                _ = X.pending
              ;(_ > f.avail_out && (_ = f.avail_out),
                _ !== 0 &&
                  (a.arraySet(f.output, X.pending_buf, X.pending_out, _, f.next_out),
                  (f.next_out += _),
                  (X.pending_out += _),
                  (f.total_out += _),
                  (f.avail_out -= _),
                  (X.pending -= _),
                  X.pending === 0 && (X.pending_out = 0)))
            }
            function k(f, X) {
              ;(o._tr_flush_block(
                f,
                0 <= f.block_start ? f.block_start : -1,
                f.strstart - f.block_start,
                X,
              ),
                (f.block_start = f.strstart),
                j(f.strm))
            }
            function z(f, X) {
              f.pending_buf[f.pending++] = X
            }
            function G(f, X) {
              ;((f.pending_buf[f.pending++] = (X >>> 8) & 255),
                (f.pending_buf[f.pending++] = 255 & X))
            }
            function te(f, X) {
              var _,
                u,
                c = f.max_chain_length,
                h = f.strstart,
                O = f.prev_length,
                H = f.nice_match,
                P = f.strstart > f.w_size - he ? f.strstart - (f.w_size - he) : 0,
                ne = f.window,
                ue = f.w_mask,
                se = f.prev,
                fe = f.strstart + oe,
                me = ne[h + O - 1],
                we = ne[h + O]
              ;(f.prev_length >= f.good_match && (c >>= 2), H > f.lookahead && (H = f.lookahead))
              do
                if (
                  ne[(_ = X) + O] === we &&
                  ne[_ + O - 1] === me &&
                  ne[_] === ne[h] &&
                  ne[++_] === ne[h + 1]
                ) {
                  ;((h += 2), _++)
                  do;
                  while (
                    ne[++h] === ne[++_] &&
                    ne[++h] === ne[++_] &&
                    ne[++h] === ne[++_] &&
                    ne[++h] === ne[++_] &&
                    ne[++h] === ne[++_] &&
                    ne[++h] === ne[++_] &&
                    ne[++h] === ne[++_] &&
                    ne[++h] === ne[++_] &&
                    h < fe
                  )
                  if (((u = oe - (fe - h)), (h = fe - oe), O < u)) {
                    if (((f.match_start = X), H <= (O = u))) break
                    ;((me = ne[h + O - 1]), (we = ne[h + O]))
                  }
                }
              while ((X = se[X & ue]) > P && --c != 0)
              return O <= f.lookahead ? O : f.lookahead
            }
            function W(f) {
              var X,
                _,
                u,
                c,
                h,
                O,
                H,
                P,
                ne,
                ue,
                se = f.w_size
              do {
                if (
                  ((c = f.window_size - f.lookahead - f.strstart), f.strstart >= se + (se - he))
                ) {
                  for (
                    a.arraySet(f.window, f.window, se, se, 0),
                      f.match_start -= se,
                      f.strstart -= se,
                      f.block_start -= se,
                      X = _ = f.hash_size;
                    (u = f.head[--X]), (f.head[X] = se <= u ? u - se : 0), --_;
                  );
                  for (X = _ = se; (u = f.prev[--X]), (f.prev[X] = se <= u ? u - se : 0), --_; );
                  c += se
                }
                if (f.strm.avail_in === 0) break
                if (
                  ((O = f.strm),
                  (H = f.window),
                  (P = f.strstart + f.lookahead),
                  (ne = c),
                  (ue = void 0),
                  (ue = O.avail_in),
                  ne < ue && (ue = ne),
                  (_ =
                    ue === 0
                      ? 0
                      : ((O.avail_in -= ue),
                        a.arraySet(H, O.input, O.next_in, ue, P),
                        O.state.wrap === 1
                          ? (O.adler = l(O.adler, H, ue, P))
                          : O.state.wrap === 2 && (O.adler = p(O.adler, H, ue, P)),
                        (O.next_in += ue),
                        (O.total_in += ue),
                        ue)),
                  (f.lookahead += _),
                  f.lookahead + f.insert >= R)
                )
                  for (
                    h = f.strstart - f.insert,
                      f.ins_h = f.window[h],
                      f.ins_h = ((f.ins_h << f.hash_shift) ^ f.window[h + 1]) & f.hash_mask;
                    f.insert &&
                    ((f.ins_h = ((f.ins_h << f.hash_shift) ^ f.window[h + R - 1]) & f.hash_mask),
                    (f.prev[h & f.w_mask] = f.head[f.ins_h]),
                    (f.head[f.ins_h] = h),
                    h++,
                    f.insert--,
                    !(f.lookahead + f.insert < R));
                  );
              } while (f.lookahead < he && f.strm.avail_in !== 0)
            }
            function y(f, X) {
              for (var _, u; ; ) {
                if (f.lookahead < he) {
                  if ((W(f), f.lookahead < he && X === v)) return S
                  if (f.lookahead === 0) break
                }
                if (
                  ((_ = 0),
                  f.lookahead >= R &&
                    ((f.ins_h =
                      ((f.ins_h << f.hash_shift) ^ f.window[f.strstart + R - 1]) & f.hash_mask),
                    (_ = f.prev[f.strstart & f.w_mask] = f.head[f.ins_h]),
                    (f.head[f.ins_h] = f.strstart)),
                  _ !== 0 && f.strstart - _ <= f.w_size - he && (f.match_length = te(f, _)),
                  f.match_length >= R)
                )
                  if (
                    ((u = o._tr_tally(f, f.strstart - f.match_start, f.match_length - R)),
                    (f.lookahead -= f.match_length),
                    f.match_length <= f.max_lazy_match && f.lookahead >= R)
                  ) {
                    for (
                      f.match_length--;
                      f.strstart++,
                        (f.ins_h =
                          ((f.ins_h << f.hash_shift) ^ f.window[f.strstart + R - 1]) & f.hash_mask),
                        (_ = f.prev[f.strstart & f.w_mask] = f.head[f.ins_h]),
                        (f.head[f.ins_h] = f.strstart),
                        --f.match_length != 0;
                    );
                    f.strstart++
                  } else
                    ((f.strstart += f.match_length),
                      (f.match_length = 0),
                      (f.ins_h = f.window[f.strstart]),
                      (f.ins_h =
                        ((f.ins_h << f.hash_shift) ^ f.window[f.strstart + 1]) & f.hash_mask))
                else ((u = o._tr_tally(f, 0, f.window[f.strstart])), f.lookahead--, f.strstart++)
                if (u && (k(f, !1), f.strm.avail_out === 0)) return S
              }
              return (
                (f.insert = f.strstart < R - 1 ? f.strstart : R - 1),
                X === E
                  ? (k(f, !0), f.strm.avail_out === 0 ? le : Z)
                  : f.last_lit && (k(f, !1), f.strm.avail_out === 0)
                    ? S
                    : Y
              )
            }
            function w(f, X) {
              for (var _, u, c; ; ) {
                if (f.lookahead < he) {
                  if ((W(f), f.lookahead < he && X === v)) return S
                  if (f.lookahead === 0) break
                }
                if (
                  ((_ = 0),
                  f.lookahead >= R &&
                    ((f.ins_h =
                      ((f.ins_h << f.hash_shift) ^ f.window[f.strstart + R - 1]) & f.hash_mask),
                    (_ = f.prev[f.strstart & f.w_mask] = f.head[f.ins_h]),
                    (f.head[f.ins_h] = f.strstart)),
                  (f.prev_length = f.match_length),
                  (f.prev_match = f.match_start),
                  (f.match_length = R - 1),
                  _ !== 0 &&
                    f.prev_length < f.max_lazy_match &&
                    f.strstart - _ <= f.w_size - he &&
                    ((f.match_length = te(f, _)),
                    f.match_length <= 5 &&
                      (f.strategy === 1 ||
                        (f.match_length === R && 4096 < f.strstart - f.match_start)) &&
                      (f.match_length = R - 1)),
                  f.prev_length >= R && f.match_length <= f.prev_length)
                ) {
                  for (
                    c = f.strstart + f.lookahead - R,
                      u = o._tr_tally(f, f.strstart - 1 - f.prev_match, f.prev_length - R),
                      f.lookahead -= f.prev_length - 1,
                      f.prev_length -= 2;
                    ++f.strstart <= c &&
                      ((f.ins_h =
                        ((f.ins_h << f.hash_shift) ^ f.window[f.strstart + R - 1]) & f.hash_mask),
                      (_ = f.prev[f.strstart & f.w_mask] = f.head[f.ins_h]),
                      (f.head[f.ins_h] = f.strstart)),
                      --f.prev_length != 0;
                  );
                  if (
                    ((f.match_available = 0),
                    (f.match_length = R - 1),
                    f.strstart++,
                    u && (k(f, !1), f.strm.avail_out === 0))
                  )
                    return S
                } else if (f.match_available) {
                  if (
                    ((u = o._tr_tally(f, 0, f.window[f.strstart - 1])) && k(f, !1),
                    f.strstart++,
                    f.lookahead--,
                    f.strm.avail_out === 0)
                  )
                    return S
                } else ((f.match_available = 1), f.strstart++, f.lookahead--)
              }
              return (
                f.match_available &&
                  ((u = o._tr_tally(f, 0, f.window[f.strstart - 1])), (f.match_available = 0)),
                (f.insert = f.strstart < R - 1 ? f.strstart : R - 1),
                X === E
                  ? (k(f, !0), f.strm.avail_out === 0 ? le : Z)
                  : f.last_lit && (k(f, !1), f.strm.avail_out === 0)
                    ? S
                    : Y
              )
            }
            function U(f, X, _, u, c) {
              ;((this.good_length = f),
                (this.max_lazy = X),
                (this.nice_length = _),
                (this.max_chain = u),
                (this.func = c))
            }
            function B() {
              ;((this.strm = null),
                (this.status = 0),
                (this.pending_buf = null),
                (this.pending_buf_size = 0),
                (this.pending_out = 0),
                (this.pending = 0),
                (this.wrap = 0),
                (this.gzhead = null),
                (this.gzindex = 0),
                (this.method = A),
                (this.last_flush = -1),
                (this.w_size = 0),
                (this.w_bits = 0),
                (this.w_mask = 0),
                (this.window = null),
                (this.window_size = 0),
                (this.prev = null),
                (this.head = null),
                (this.ins_h = 0),
                (this.hash_size = 0),
                (this.hash_bits = 0),
                (this.hash_mask = 0),
                (this.hash_shift = 0),
                (this.block_start = 0),
                (this.match_length = 0),
                (this.prev_match = 0),
                (this.match_available = 0),
                (this.strstart = 0),
                (this.match_start = 0),
                (this.lookahead = 0),
                (this.prev_length = 0),
                (this.max_chain_length = 0),
                (this.max_lazy_match = 0),
                (this.level = 0),
                (this.strategy = 0),
                (this.good_match = 0),
                (this.nice_match = 0),
                (this.dyn_ltree = new a.Buf16(2 * K)),
                (this.dyn_dtree = new a.Buf16(2 * (2 * L + 1))),
                (this.bl_tree = new a.Buf16(2 * (2 * q + 1))),
                de(this.dyn_ltree),
                de(this.dyn_dtree),
                de(this.bl_tree),
                (this.l_desc = null),
                (this.d_desc = null),
                (this.bl_desc = null),
                (this.bl_count = new a.Buf16(J + 1)),
                (this.heap = new a.Buf16(2 * D + 1)),
                de(this.heap),
                (this.heap_len = 0),
                (this.heap_max = 0),
                (this.depth = new a.Buf16(2 * D + 1)),
                de(this.depth),
                (this.l_buf = 0),
                (this.lit_bufsize = 0),
                (this.last_lit = 0),
                (this.d_buf = 0),
                (this.opt_len = 0),
                (this.static_len = 0),
                (this.matches = 0),
                (this.insert = 0),
                (this.bi_buf = 0),
                (this.bi_valid = 0))
            }
            function N(f) {
              var X
              return f && f.state
                ? ((f.total_in = f.total_out = 0),
                  (f.data_type = m),
                  ((X = f.state).pending = 0),
                  (X.pending_out = 0),
                  X.wrap < 0 && (X.wrap = -X.wrap),
                  (X.status = X.wrap ? F : V),
                  (f.adler = X.wrap === 2 ? 0 : 1),
                  (X.last_flush = v),
                  o._tr_init(X),
                  d)
                : pe(f, x)
            }
            function C(f) {
              var X = N(f)
              return (
                X === d &&
                  (function (_) {
                    ;((_.window_size = 2 * _.w_size),
                      de(_.head),
                      (_.max_lazy_match = s[_.level].max_lazy),
                      (_.good_match = s[_.level].good_length),
                      (_.nice_match = s[_.level].nice_length),
                      (_.max_chain_length = s[_.level].max_chain),
                      (_.strstart = 0),
                      (_.block_start = 0),
                      (_.lookahead = 0),
                      (_.insert = 0),
                      (_.match_length = _.prev_length = R - 1),
                      (_.match_available = 0),
                      (_.ins_h = 0))
                  })(f.state),
                X
              )
            }
            function ee(f, X, _, u, c, h) {
              if (!f) return x
              var O = 1
              if (
                (X === b && (X = 6),
                u < 0 ? ((O = 0), (u = -u)) : 15 < u && ((O = 2), (u -= 16)),
                c < 1 || I < c || _ !== A || u < 8 || 15 < u || X < 0 || 9 < X || h < 0 || T < h)
              )
                return pe(f, x)
              u === 8 && (u = 9)
              var H = new B()
              return (
                ((f.state = H).strm = f),
                (H.wrap = O),
                (H.gzhead = null),
                (H.w_bits = u),
                (H.w_size = 1 << H.w_bits),
                (H.w_mask = H.w_size - 1),
                (H.hash_bits = c + 7),
                (H.hash_size = 1 << H.hash_bits),
                (H.hash_mask = H.hash_size - 1),
                (H.hash_shift = ~~((H.hash_bits + R - 1) / R)),
                (H.window = new a.Buf8(2 * H.w_size)),
                (H.head = new a.Buf16(H.hash_size)),
                (H.prev = new a.Buf16(H.w_size)),
                (H.lit_bufsize = 1 << (c + 6)),
                (H.pending_buf_size = 4 * H.lit_bufsize),
                (H.pending_buf = new a.Buf8(H.pending_buf_size)),
                (H.d_buf = 1 * H.lit_bufsize),
                (H.l_buf = 3 * H.lit_bufsize),
                (H.level = X),
                (H.strategy = h),
                (H.method = _),
                C(f)
              )
            }
            ;((s = [
              new U(0, 0, 0, 0, function (f, X) {
                var _ = 65535
                for (_ > f.pending_buf_size - 5 && (_ = f.pending_buf_size - 5); ; ) {
                  if (f.lookahead <= 1) {
                    if ((W(f), f.lookahead === 0 && X === v)) return S
                    if (f.lookahead === 0) break
                  }
                  ;((f.strstart += f.lookahead), (f.lookahead = 0))
                  var u = f.block_start + _
                  if (
                    ((f.strstart === 0 || f.strstart >= u) &&
                      ((f.lookahead = f.strstart - u),
                      (f.strstart = u),
                      k(f, !1),
                      f.strm.avail_out === 0)) ||
                    (f.strstart - f.block_start >= f.w_size - he &&
                      (k(f, !1), f.strm.avail_out === 0))
                  )
                    return S
                }
                return (
                  (f.insert = 0),
                  X === E
                    ? (k(f, !0), f.strm.avail_out === 0 ? le : Z)
                    : (f.strstart > f.block_start && (k(f, !1), f.strm.avail_out), S)
                )
              }),
              new U(4, 4, 8, 4, y),
              new U(4, 5, 16, 8, y),
              new U(4, 6, 32, 32, y),
              new U(4, 4, 16, 16, w),
              new U(8, 16, 32, 32, w),
              new U(8, 16, 128, 128, w),
              new U(8, 32, 128, 256, w),
              new U(32, 128, 258, 1024, w),
              new U(32, 258, 258, 4096, w),
            ]),
              (i.deflateInit = function (f, X) {
                return ee(f, X, A, 15, 8, 0)
              }),
              (i.deflateInit2 = ee),
              (i.deflateReset = C),
              (i.deflateResetKeep = N),
              (i.deflateSetHeader = function (f, X) {
                return f && f.state ? (f.state.wrap !== 2 ? x : ((f.state.gzhead = X), d)) : x
              }),
              (i.deflate = function (f, X) {
                var _, u, c, h
                if (!f || !f.state || 5 < X || X < 0) return f ? pe(f, x) : x
                if (
                  ((u = f.state),
                  !f.output || (!f.input && f.avail_in !== 0) || (u.status === 666 && X !== E))
                )
                  return pe(f, f.avail_out === 0 ? -5 : x)
                if (((u.strm = f), (_ = u.last_flush), (u.last_flush = X), u.status === F))
                  if (u.wrap === 2)
                    ((f.adler = 0),
                      z(u, 31),
                      z(u, 139),
                      z(u, 8),
                      u.gzhead
                        ? (z(
                            u,
                            (u.gzhead.text ? 1 : 0) +
                              (u.gzhead.hcrc ? 2 : 0) +
                              (u.gzhead.extra ? 4 : 0) +
                              (u.gzhead.name ? 8 : 0) +
                              (u.gzhead.comment ? 16 : 0),
                          ),
                          z(u, 255 & u.gzhead.time),
                          z(u, (u.gzhead.time >> 8) & 255),
                          z(u, (u.gzhead.time >> 16) & 255),
                          z(u, (u.gzhead.time >> 24) & 255),
                          z(u, u.level === 9 ? 2 : 2 <= u.strategy || u.level < 2 ? 4 : 0),
                          z(u, 255 & u.gzhead.os),
                          u.gzhead.extra &&
                            u.gzhead.extra.length &&
                            (z(u, 255 & u.gzhead.extra.length),
                            z(u, (u.gzhead.extra.length >> 8) & 255)),
                          u.gzhead.hcrc && (f.adler = p(f.adler, u.pending_buf, u.pending, 0)),
                          (u.gzindex = 0),
                          (u.status = 69))
                        : (z(u, 0),
                          z(u, 0),
                          z(u, 0),
                          z(u, 0),
                          z(u, 0),
                          z(u, u.level === 9 ? 2 : 2 <= u.strategy || u.level < 2 ? 4 : 0),
                          z(u, 3),
                          (u.status = V)))
                  else {
                    var O = (A + ((u.w_bits - 8) << 4)) << 8
                    ;((O |=
                      (2 <= u.strategy || u.level < 2
                        ? 0
                        : u.level < 6
                          ? 1
                          : u.level === 6
                            ? 2
                            : 3) << 6),
                      u.strstart !== 0 && (O |= 32),
                      (O += 31 - (O % 31)),
                      (u.status = V),
                      G(u, O),
                      u.strstart !== 0 && (G(u, f.adler >>> 16), G(u, 65535 & f.adler)),
                      (f.adler = 1))
                  }
                if (u.status === 69)
                  if (u.gzhead.extra) {
                    for (
                      c = u.pending;
                      u.gzindex < (65535 & u.gzhead.extra.length) &&
                      (u.pending !== u.pending_buf_size ||
                        (u.gzhead.hcrc &&
                          u.pending > c &&
                          (f.adler = p(f.adler, u.pending_buf, u.pending - c, c)),
                        j(f),
                        (c = u.pending),
                        u.pending !== u.pending_buf_size));
                    )
                      (z(u, 255 & u.gzhead.extra[u.gzindex]), u.gzindex++)
                    ;(u.gzhead.hcrc &&
                      u.pending > c &&
                      (f.adler = p(f.adler, u.pending_buf, u.pending - c, c)),
                      u.gzindex === u.gzhead.extra.length && ((u.gzindex = 0), (u.status = 73)))
                  } else u.status = 73
                if (u.status === 73)
                  if (u.gzhead.name) {
                    c = u.pending
                    do {
                      if (
                        u.pending === u.pending_buf_size &&
                        (u.gzhead.hcrc &&
                          u.pending > c &&
                          (f.adler = p(f.adler, u.pending_buf, u.pending - c, c)),
                        j(f),
                        (c = u.pending),
                        u.pending === u.pending_buf_size)
                      ) {
                        h = 1
                        break
                      }
                      ;((h =
                        u.gzindex < u.gzhead.name.length
                          ? 255 & u.gzhead.name.charCodeAt(u.gzindex++)
                          : 0),
                        z(u, h))
                    } while (h !== 0)
                    ;(u.gzhead.hcrc &&
                      u.pending > c &&
                      (f.adler = p(f.adler, u.pending_buf, u.pending - c, c)),
                      h === 0 && ((u.gzindex = 0), (u.status = 91)))
                  } else u.status = 91
                if (u.status === 91)
                  if (u.gzhead.comment) {
                    c = u.pending
                    do {
                      if (
                        u.pending === u.pending_buf_size &&
                        (u.gzhead.hcrc &&
                          u.pending > c &&
                          (f.adler = p(f.adler, u.pending_buf, u.pending - c, c)),
                        j(f),
                        (c = u.pending),
                        u.pending === u.pending_buf_size)
                      ) {
                        h = 1
                        break
                      }
                      ;((h =
                        u.gzindex < u.gzhead.comment.length
                          ? 255 & u.gzhead.comment.charCodeAt(u.gzindex++)
                          : 0),
                        z(u, h))
                    } while (h !== 0)
                    ;(u.gzhead.hcrc &&
                      u.pending > c &&
                      (f.adler = p(f.adler, u.pending_buf, u.pending - c, c)),
                      h === 0 && (u.status = 103))
                  } else u.status = 103
                if (
                  (u.status === 103 &&
                    (u.gzhead.hcrc
                      ? (u.pending + 2 > u.pending_buf_size && j(f),
                        u.pending + 2 <= u.pending_buf_size &&
                          (z(u, 255 & f.adler),
                          z(u, (f.adler >> 8) & 255),
                          (f.adler = 0),
                          (u.status = V)))
                      : (u.status = V)),
                  u.pending !== 0)
                ) {
                  if ((j(f), f.avail_out === 0)) return ((u.last_flush = -1), d)
                } else if (f.avail_in === 0 && re(X) <= re(_) && X !== E) return pe(f, -5)
                if (u.status === 666 && f.avail_in !== 0) return pe(f, -5)
                if (f.avail_in !== 0 || u.lookahead !== 0 || (X !== v && u.status !== 666)) {
                  var H =
                    u.strategy === 2
                      ? (function (P, ne) {
                          for (var ue; ; ) {
                            if (P.lookahead === 0 && (W(P), P.lookahead === 0)) {
                              if (ne === v) return S
                              break
                            }
                            if (
                              ((P.match_length = 0),
                              (ue = o._tr_tally(P, 0, P.window[P.strstart])),
                              P.lookahead--,
                              P.strstart++,
                              ue && (k(P, !1), P.strm.avail_out === 0))
                            )
                              return S
                          }
                          return (
                            (P.insert = 0),
                            ne === E
                              ? (k(P, !0), P.strm.avail_out === 0 ? le : Z)
                              : P.last_lit && (k(P, !1), P.strm.avail_out === 0)
                                ? S
                                : Y
                          )
                        })(u, X)
                      : u.strategy === 3
                        ? (function (P, ne) {
                            for (var ue, se, fe, me, we = P.window; ; ) {
                              if (P.lookahead <= oe) {
                                if ((W(P), P.lookahead <= oe && ne === v)) return S
                                if (P.lookahead === 0) break
                              }
                              if (
                                ((P.match_length = 0),
                                P.lookahead >= R &&
                                  0 < P.strstart &&
                                  (se = we[(fe = P.strstart - 1)]) === we[++fe] &&
                                  se === we[++fe] &&
                                  se === we[++fe])
                              ) {
                                me = P.strstart + oe
                                do;
                                while (
                                  se === we[++fe] &&
                                  se === we[++fe] &&
                                  se === we[++fe] &&
                                  se === we[++fe] &&
                                  se === we[++fe] &&
                                  se === we[++fe] &&
                                  se === we[++fe] &&
                                  se === we[++fe] &&
                                  fe < me
                                )
                                ;((P.match_length = oe - (me - fe)),
                                  P.match_length > P.lookahead && (P.match_length = P.lookahead))
                              }
                              if (
                                (P.match_length >= R
                                  ? ((ue = o._tr_tally(P, 1, P.match_length - R)),
                                    (P.lookahead -= P.match_length),
                                    (P.strstart += P.match_length),
                                    (P.match_length = 0))
                                  : ((ue = o._tr_tally(P, 0, P.window[P.strstart])),
                                    P.lookahead--,
                                    P.strstart++),
                                ue && (k(P, !1), P.strm.avail_out === 0))
                              )
                                return S
                            }
                            return (
                              (P.insert = 0),
                              ne === E
                                ? (k(P, !0), P.strm.avail_out === 0 ? le : Z)
                                : P.last_lit && (k(P, !1), P.strm.avail_out === 0)
                                  ? S
                                  : Y
                            )
                          })(u, X)
                        : s[u.level].func(u, X)
                  if (((H !== le && H !== Z) || (u.status = 666), H === S || H === le))
                    return (f.avail_out === 0 && (u.last_flush = -1), d)
                  if (
                    H === Y &&
                    (X === 1
                      ? o._tr_align(u)
                      : X !== 5 &&
                        (o._tr_stored_block(u, 0, 0, !1),
                        X === 3 &&
                          (de(u.head),
                          u.lookahead === 0 &&
                            ((u.strstart = 0), (u.block_start = 0), (u.insert = 0)))),
                    j(f),
                    f.avail_out === 0)
                  )
                    return ((u.last_flush = -1), d)
                }
                return X !== E
                  ? d
                  : u.wrap <= 0
                    ? 1
                    : (u.wrap === 2
                        ? (z(u, 255 & f.adler),
                          z(u, (f.adler >> 8) & 255),
                          z(u, (f.adler >> 16) & 255),
                          z(u, (f.adler >> 24) & 255),
                          z(u, 255 & f.total_in),
                          z(u, (f.total_in >> 8) & 255),
                          z(u, (f.total_in >> 16) & 255),
                          z(u, (f.total_in >> 24) & 255))
                        : (G(u, f.adler >>> 16), G(u, 65535 & f.adler)),
                      j(f),
                      0 < u.wrap && (u.wrap = -u.wrap),
                      u.pending !== 0 ? d : 1)
              }),
              (i.deflateEnd = function (f) {
                var X
                return f && f.state
                  ? (X = f.state.status) !== F &&
                    X !== 69 &&
                    X !== 73 &&
                    X !== 91 &&
                    X !== 103 &&
                    X !== V &&
                    X !== 666
                    ? pe(f, x)
                    : ((f.state = null), X === V ? pe(f, -3) : d)
                  : x
              }),
              (i.deflateSetDictionary = function (f, X) {
                var _,
                  u,
                  c,
                  h,
                  O,
                  H,
                  P,
                  ne,
                  ue = X.length
                if (
                  !f ||
                  !f.state ||
                  (h = (_ = f.state).wrap) === 2 ||
                  (h === 1 && _.status !== F) ||
                  _.lookahead
                )
                  return x
                for (
                  h === 1 && (f.adler = l(f.adler, X, ue, 0)),
                    _.wrap = 0,
                    ue >= _.w_size &&
                      (h === 0 &&
                        (de(_.head), (_.strstart = 0), (_.block_start = 0), (_.insert = 0)),
                      (ne = new a.Buf8(_.w_size)),
                      a.arraySet(ne, X, ue - _.w_size, _.w_size, 0),
                      (X = ne),
                      (ue = _.w_size)),
                    O = f.avail_in,
                    H = f.next_in,
                    P = f.input,
                    f.avail_in = ue,
                    f.next_in = 0,
                    f.input = X,
                    W(_);
                  _.lookahead >= R;
                ) {
                  for (
                    u = _.strstart, c = _.lookahead - (R - 1);
                    (_.ins_h = ((_.ins_h << _.hash_shift) ^ _.window[u + R - 1]) & _.hash_mask),
                      (_.prev[u & _.w_mask] = _.head[_.ins_h]),
                      (_.head[_.ins_h] = u),
                      u++,
                      --c;
                  );
                  ;((_.strstart = u), (_.lookahead = R - 1), W(_))
                }
                return (
                  (_.strstart += _.lookahead),
                  (_.block_start = _.strstart),
                  (_.insert = _.lookahead),
                  (_.lookahead = 0),
                  (_.match_length = _.prev_length = R - 1),
                  (_.match_available = 0),
                  (f.next_in = H),
                  (f.input = P),
                  (f.avail_in = O),
                  (_.wrap = h),
                  d
                )
              }),
              (i.deflateInfo = 'pako deflate (from Nodeca project)'))
          },
          {
            '../utils/common': 41,
            './adler32': 43,
            './crc32': 45,
            './messages': 51,
            './trees': 52,
          },
        ],
        47: [
          function (r, n, i) {
            n.exports = function () {
              ;((this.text = 0),
                (this.time = 0),
                (this.xflags = 0),
                (this.os = 0),
                (this.extra = null),
                (this.extra_len = 0),
                (this.name = ''),
                (this.comment = ''),
                (this.hcrc = 0),
                (this.done = !1))
            }
          },
          {},
        ],
        48: [
          function (r, n, i) {
            n.exports = function (s, a) {
              var o, l, p, g, v, E, d, x, b, T, m, A, I, D, L, q, K, J, R, oe, he, F, V, S, Y
              ;((o = s.state),
                (l = s.next_in),
                (S = s.input),
                (p = l + (s.avail_in - 5)),
                (g = s.next_out),
                (Y = s.output),
                (v = g - (a - s.avail_out)),
                (E = g + (s.avail_out - 257)),
                (d = o.dmax),
                (x = o.wsize),
                (b = o.whave),
                (T = o.wnext),
                (m = o.window),
                (A = o.hold),
                (I = o.bits),
                (D = o.lencode),
                (L = o.distcode),
                (q = (1 << o.lenbits) - 1),
                (K = (1 << o.distbits) - 1))
              e: do {
                ;(I < 15 && ((A += S[l++] << I), (I += 8), (A += S[l++] << I), (I += 8)),
                  (J = D[A & q]))
                t: for (;;) {
                  if (((A >>>= R = J >>> 24), (I -= R), (R = (J >>> 16) & 255) === 0))
                    Y[g++] = 65535 & J
                  else {
                    if (!(16 & R)) {
                      if (!(64 & R)) {
                        J = D[(65535 & J) + (A & ((1 << R) - 1))]
                        continue t
                      }
                      if (32 & R) {
                        o.mode = 12
                        break e
                      }
                      ;((s.msg = 'invalid literal/length code'), (o.mode = 30))
                      break e
                    }
                    ;((oe = 65535 & J),
                      (R &= 15) &&
                        (I < R && ((A += S[l++] << I), (I += 8)),
                        (oe += A & ((1 << R) - 1)),
                        (A >>>= R),
                        (I -= R)),
                      I < 15 && ((A += S[l++] << I), (I += 8), (A += S[l++] << I), (I += 8)),
                      (J = L[A & K]))
                    r: for (;;) {
                      if (((A >>>= R = J >>> 24), (I -= R), !(16 & (R = (J >>> 16) & 255)))) {
                        if (!(64 & R)) {
                          J = L[(65535 & J) + (A & ((1 << R) - 1))]
                          continue r
                        }
                        ;((s.msg = 'invalid distance code'), (o.mode = 30))
                        break e
                      }
                      if (
                        ((he = 65535 & J),
                        I < (R &= 15) &&
                          ((A += S[l++] << I), (I += 8) < R && ((A += S[l++] << I), (I += 8))),
                        d < (he += A & ((1 << R) - 1)))
                      ) {
                        ;((s.msg = 'invalid distance too far back'), (o.mode = 30))
                        break e
                      }
                      if (((A >>>= R), (I -= R), (R = g - v) < he)) {
                        if (b < (R = he - R) && o.sane) {
                          ;((s.msg = 'invalid distance too far back'), (o.mode = 30))
                          break e
                        }
                        if (((V = m), (F = 0) === T)) {
                          if (((F += x - R), R < oe)) {
                            for (oe -= R; (Y[g++] = m[F++]), --R; );
                            ;((F = g - he), (V = Y))
                          }
                        } else if (T < R) {
                          if (((F += x + T - R), (R -= T) < oe)) {
                            for (oe -= R; (Y[g++] = m[F++]), --R; );
                            if (((F = 0), T < oe)) {
                              for (oe -= R = T; (Y[g++] = m[F++]), --R; );
                              ;((F = g - he), (V = Y))
                            }
                          }
                        } else if (((F += T - R), R < oe)) {
                          for (oe -= R; (Y[g++] = m[F++]), --R; );
                          ;((F = g - he), (V = Y))
                        }
                        for (; 2 < oe; )
                          ((Y[g++] = V[F++]), (Y[g++] = V[F++]), (Y[g++] = V[F++]), (oe -= 3))
                        oe && ((Y[g++] = V[F++]), 1 < oe && (Y[g++] = V[F++]))
                      } else {
                        for (
                          F = g - he;
                          (Y[g++] = Y[F++]), (Y[g++] = Y[F++]), (Y[g++] = Y[F++]), 2 < (oe -= 3);
                        );
                        oe && ((Y[g++] = Y[F++]), 1 < oe && (Y[g++] = Y[F++]))
                      }
                      break
                    }
                  }
                  break
                }
              } while (l < p && g < E)
              ;((l -= oe = I >> 3),
                (A &= (1 << (I -= oe << 3)) - 1),
                (s.next_in = l),
                (s.next_out = g),
                (s.avail_in = l < p ? p - l + 5 : 5 - (l - p)),
                (s.avail_out = g < E ? E - g + 257 : 257 - (g - E)),
                (o.hold = A),
                (o.bits = I))
            }
          },
          {},
        ],
        49: [
          function (r, n, i) {
            var s = r('../utils/common'),
              a = r('./adler32'),
              o = r('./crc32'),
              l = r('./inffast'),
              p = r('./inftrees'),
              g = 1,
              v = 2,
              E = 0,
              d = -2,
              x = 1,
              b = 852,
              T = 592
            function m(F) {
              return (
                ((F >>> 24) & 255) + ((F >>> 8) & 65280) + ((65280 & F) << 8) + ((255 & F) << 24)
              )
            }
            function A() {
              ;((this.mode = 0),
                (this.last = !1),
                (this.wrap = 0),
                (this.havedict = !1),
                (this.flags = 0),
                (this.dmax = 0),
                (this.check = 0),
                (this.total = 0),
                (this.head = null),
                (this.wbits = 0),
                (this.wsize = 0),
                (this.whave = 0),
                (this.wnext = 0),
                (this.window = null),
                (this.hold = 0),
                (this.bits = 0),
                (this.length = 0),
                (this.offset = 0),
                (this.extra = 0),
                (this.lencode = null),
                (this.distcode = null),
                (this.lenbits = 0),
                (this.distbits = 0),
                (this.ncode = 0),
                (this.nlen = 0),
                (this.ndist = 0),
                (this.have = 0),
                (this.next = null),
                (this.lens = new s.Buf16(320)),
                (this.work = new s.Buf16(288)),
                (this.lendyn = null),
                (this.distdyn = null),
                (this.sane = 0),
                (this.back = 0),
                (this.was = 0))
            }
            function I(F) {
              var V
              return F && F.state
                ? ((V = F.state),
                  (F.total_in = F.total_out = V.total = 0),
                  (F.msg = ''),
                  V.wrap && (F.adler = 1 & V.wrap),
                  (V.mode = x),
                  (V.last = 0),
                  (V.havedict = 0),
                  (V.dmax = 32768),
                  (V.head = null),
                  (V.hold = 0),
                  (V.bits = 0),
                  (V.lencode = V.lendyn = new s.Buf32(b)),
                  (V.distcode = V.distdyn = new s.Buf32(T)),
                  (V.sane = 1),
                  (V.back = -1),
                  E)
                : d
            }
            function D(F) {
              var V
              return F && F.state
                ? (((V = F.state).wsize = 0), (V.whave = 0), (V.wnext = 0), I(F))
                : d
            }
            function L(F, V) {
              var S, Y
              return F && F.state
                ? ((Y = F.state),
                  V < 0 ? ((S = 0), (V = -V)) : ((S = 1 + (V >> 4)), V < 48 && (V &= 15)),
                  V && (V < 8 || 15 < V)
                    ? d
                    : (Y.window !== null && Y.wbits !== V && (Y.window = null),
                      (Y.wrap = S),
                      (Y.wbits = V),
                      D(F)))
                : d
            }
            function q(F, V) {
              var S, Y
              return F
                ? ((Y = new A()),
                  ((F.state = Y).window = null),
                  (S = L(F, V)) !== E && (F.state = null),
                  S)
                : d
            }
            var K,
              J,
              R = !0
            function oe(F) {
              if (R) {
                var V
                for (K = new s.Buf32(512), J = new s.Buf32(32), V = 0; V < 144; ) F.lens[V++] = 8
                for (; V < 256; ) F.lens[V++] = 9
                for (; V < 280; ) F.lens[V++] = 7
                for (; V < 288; ) F.lens[V++] = 8
                for (p(g, F.lens, 0, 288, K, 0, F.work, { bits: 9 }), V = 0; V < 32; )
                  F.lens[V++] = 5
                ;(p(v, F.lens, 0, 32, J, 0, F.work, { bits: 5 }), (R = !1))
              }
              ;((F.lencode = K), (F.lenbits = 9), (F.distcode = J), (F.distbits = 5))
            }
            function he(F, V, S, Y) {
              var le,
                Z = F.state
              return (
                Z.window === null &&
                  ((Z.wsize = 1 << Z.wbits),
                  (Z.wnext = 0),
                  (Z.whave = 0),
                  (Z.window = new s.Buf8(Z.wsize))),
                Y >= Z.wsize
                  ? (s.arraySet(Z.window, V, S - Z.wsize, Z.wsize, 0),
                    (Z.wnext = 0),
                    (Z.whave = Z.wsize))
                  : (Y < (le = Z.wsize - Z.wnext) && (le = Y),
                    s.arraySet(Z.window, V, S - Y, le, Z.wnext),
                    (Y -= le)
                      ? (s.arraySet(Z.window, V, S - Y, Y, 0), (Z.wnext = Y), (Z.whave = Z.wsize))
                      : ((Z.wnext += le),
                        Z.wnext === Z.wsize && (Z.wnext = 0),
                        Z.whave < Z.wsize && (Z.whave += le))),
                0
              )
            }
            ;((i.inflateReset = D),
              (i.inflateReset2 = L),
              (i.inflateResetKeep = I),
              (i.inflateInit = function (F) {
                return q(F, 15)
              }),
              (i.inflateInit2 = q),
              (i.inflate = function (F, V) {
                var S,
                  Y,
                  le,
                  Z,
                  pe,
                  re,
                  de,
                  j,
                  k,
                  z,
                  G,
                  te,
                  W,
                  y,
                  w,
                  U,
                  B,
                  N,
                  C,
                  ee,
                  f,
                  X,
                  _,
                  u,
                  c = 0,
                  h = new s.Buf8(4),
                  O = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
                if (!F || !F.state || !F.output || (!F.input && F.avail_in !== 0)) return d
                ;((S = F.state).mode === 12 && (S.mode = 13),
                  (pe = F.next_out),
                  (le = F.output),
                  (de = F.avail_out),
                  (Z = F.next_in),
                  (Y = F.input),
                  (re = F.avail_in),
                  (j = S.hold),
                  (k = S.bits),
                  (z = re),
                  (G = de),
                  (X = E))
                e: for (;;)
                  switch (S.mode) {
                    case x:
                      if (S.wrap === 0) {
                        S.mode = 13
                        break
                      }
                      for (; k < 16; ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      if (2 & S.wrap && j === 35615) {
                        ;((h[(S.check = 0)] = 255 & j),
                          (h[1] = (j >>> 8) & 255),
                          (S.check = o(S.check, h, 2, 0)),
                          (k = j = 0),
                          (S.mode = 2))
                        break
                      }
                      if (
                        ((S.flags = 0),
                        S.head && (S.head.done = !1),
                        !(1 & S.wrap) || (((255 & j) << 8) + (j >> 8)) % 31)
                      ) {
                        ;((F.msg = 'incorrect header check'), (S.mode = 30))
                        break
                      }
                      if ((15 & j) != 8) {
                        ;((F.msg = 'unknown compression method'), (S.mode = 30))
                        break
                      }
                      if (((k -= 4), (f = 8 + (15 & (j >>>= 4))), S.wbits === 0)) S.wbits = f
                      else if (f > S.wbits) {
                        ;((F.msg = 'invalid window size'), (S.mode = 30))
                        break
                      }
                      ;((S.dmax = 1 << f),
                        (F.adler = S.check = 1),
                        (S.mode = 512 & j ? 10 : 12),
                        (k = j = 0))
                      break
                    case 2:
                      for (; k < 16; ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      if (((S.flags = j), (255 & S.flags) != 8)) {
                        ;((F.msg = 'unknown compression method'), (S.mode = 30))
                        break
                      }
                      if (57344 & S.flags) {
                        ;((F.msg = 'unknown header flags set'), (S.mode = 30))
                        break
                      }
                      ;(S.head && (S.head.text = (j >> 8) & 1),
                        512 & S.flags &&
                          ((h[0] = 255 & j),
                          (h[1] = (j >>> 8) & 255),
                          (S.check = o(S.check, h, 2, 0))),
                        (k = j = 0),
                        (S.mode = 3))
                    case 3:
                      for (; k < 32; ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      ;(S.head && (S.head.time = j),
                        512 & S.flags &&
                          ((h[0] = 255 & j),
                          (h[1] = (j >>> 8) & 255),
                          (h[2] = (j >>> 16) & 255),
                          (h[3] = (j >>> 24) & 255),
                          (S.check = o(S.check, h, 4, 0))),
                        (k = j = 0),
                        (S.mode = 4))
                    case 4:
                      for (; k < 16; ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      ;(S.head && ((S.head.xflags = 255 & j), (S.head.os = j >> 8)),
                        512 & S.flags &&
                          ((h[0] = 255 & j),
                          (h[1] = (j >>> 8) & 255),
                          (S.check = o(S.check, h, 2, 0))),
                        (k = j = 0),
                        (S.mode = 5))
                    case 5:
                      if (1024 & S.flags) {
                        for (; k < 16; ) {
                          if (re === 0) break e
                          ;(re--, (j += Y[Z++] << k), (k += 8))
                        }
                        ;((S.length = j),
                          S.head && (S.head.extra_len = j),
                          512 & S.flags &&
                            ((h[0] = 255 & j),
                            (h[1] = (j >>> 8) & 255),
                            (S.check = o(S.check, h, 2, 0))),
                          (k = j = 0))
                      } else S.head && (S.head.extra = null)
                      S.mode = 6
                    case 6:
                      if (
                        1024 & S.flags &&
                        (re < (te = S.length) && (te = re),
                        te &&
                          (S.head &&
                            ((f = S.head.extra_len - S.length),
                            S.head.extra || (S.head.extra = new Array(S.head.extra_len)),
                            s.arraySet(S.head.extra, Y, Z, te, f)),
                          512 & S.flags && (S.check = o(S.check, Y, te, Z)),
                          (re -= te),
                          (Z += te),
                          (S.length -= te)),
                        S.length)
                      )
                        break e
                      ;((S.length = 0), (S.mode = 7))
                    case 7:
                      if (2048 & S.flags) {
                        if (re === 0) break e
                        for (
                          te = 0;
                          (f = Y[Z + te++]),
                            S.head &&
                              f &&
                              S.length < 65536 &&
                              (S.head.name += String.fromCharCode(f)),
                            f && te < re;
                        );
                        if (
                          (512 & S.flags && (S.check = o(S.check, Y, te, Z)),
                          (re -= te),
                          (Z += te),
                          f)
                        )
                          break e
                      } else S.head && (S.head.name = null)
                      ;((S.length = 0), (S.mode = 8))
                    case 8:
                      if (4096 & S.flags) {
                        if (re === 0) break e
                        for (
                          te = 0;
                          (f = Y[Z + te++]),
                            S.head &&
                              f &&
                              S.length < 65536 &&
                              (S.head.comment += String.fromCharCode(f)),
                            f && te < re;
                        );
                        if (
                          (512 & S.flags && (S.check = o(S.check, Y, te, Z)),
                          (re -= te),
                          (Z += te),
                          f)
                        )
                          break e
                      } else S.head && (S.head.comment = null)
                      S.mode = 9
                    case 9:
                      if (512 & S.flags) {
                        for (; k < 16; ) {
                          if (re === 0) break e
                          ;(re--, (j += Y[Z++] << k), (k += 8))
                        }
                        if (j !== (65535 & S.check)) {
                          ;((F.msg = 'header crc mismatch'), (S.mode = 30))
                          break
                        }
                        k = j = 0
                      }
                      ;(S.head && ((S.head.hcrc = (S.flags >> 9) & 1), (S.head.done = !0)),
                        (F.adler = S.check = 0),
                        (S.mode = 12))
                      break
                    case 10:
                      for (; k < 32; ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      ;((F.adler = S.check = m(j)), (k = j = 0), (S.mode = 11))
                    case 11:
                      if (S.havedict === 0)
                        return (
                          (F.next_out = pe),
                          (F.avail_out = de),
                          (F.next_in = Z),
                          (F.avail_in = re),
                          (S.hold = j),
                          (S.bits = k),
                          2
                        )
                      ;((F.adler = S.check = 1), (S.mode = 12))
                    case 12:
                      if (V === 5 || V === 6) break e
                    case 13:
                      if (S.last) {
                        ;((j >>>= 7 & k), (k -= 7 & k), (S.mode = 27))
                        break
                      }
                      for (; k < 3; ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      switch (((S.last = 1 & j), (k -= 1), 3 & (j >>>= 1))) {
                        case 0:
                          S.mode = 14
                          break
                        case 1:
                          if ((oe(S), (S.mode = 20), V !== 6)) break
                          ;((j >>>= 2), (k -= 2))
                          break e
                        case 2:
                          S.mode = 17
                          break
                        case 3:
                          ;((F.msg = 'invalid block type'), (S.mode = 30))
                      }
                      ;((j >>>= 2), (k -= 2))
                      break
                    case 14:
                      for (j >>>= 7 & k, k -= 7 & k; k < 32; ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      if ((65535 & j) != ((j >>> 16) ^ 65535)) {
                        ;((F.msg = 'invalid stored block lengths'), (S.mode = 30))
                        break
                      }
                      if (((S.length = 65535 & j), (k = j = 0), (S.mode = 15), V === 6)) break e
                    case 15:
                      S.mode = 16
                    case 16:
                      if ((te = S.length)) {
                        if ((re < te && (te = re), de < te && (te = de), te === 0)) break e
                        ;(s.arraySet(le, Y, Z, te, pe),
                          (re -= te),
                          (Z += te),
                          (de -= te),
                          (pe += te),
                          (S.length -= te))
                        break
                      }
                      S.mode = 12
                      break
                    case 17:
                      for (; k < 14; ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      if (
                        ((S.nlen = 257 + (31 & j)),
                        (j >>>= 5),
                        (k -= 5),
                        (S.ndist = 1 + (31 & j)),
                        (j >>>= 5),
                        (k -= 5),
                        (S.ncode = 4 + (15 & j)),
                        (j >>>= 4),
                        (k -= 4),
                        286 < S.nlen || 30 < S.ndist)
                      ) {
                        ;((F.msg = 'too many length or distance symbols'), (S.mode = 30))
                        break
                      }
                      ;((S.have = 0), (S.mode = 18))
                    case 18:
                      for (; S.have < S.ncode; ) {
                        for (; k < 3; ) {
                          if (re === 0) break e
                          ;(re--, (j += Y[Z++] << k), (k += 8))
                        }
                        ;((S.lens[O[S.have++]] = 7 & j), (j >>>= 3), (k -= 3))
                      }
                      for (; S.have < 19; ) S.lens[O[S.have++]] = 0
                      if (
                        ((S.lencode = S.lendyn),
                        (S.lenbits = 7),
                        (_ = { bits: S.lenbits }),
                        (X = p(0, S.lens, 0, 19, S.lencode, 0, S.work, _)),
                        (S.lenbits = _.bits),
                        X)
                      ) {
                        ;((F.msg = 'invalid code lengths set'), (S.mode = 30))
                        break
                      }
                      ;((S.have = 0), (S.mode = 19))
                    case 19:
                      for (; S.have < S.nlen + S.ndist; ) {
                        for (
                          ;
                          (U = ((c = S.lencode[j & ((1 << S.lenbits) - 1)]) >>> 16) & 255),
                            (B = 65535 & c),
                            !((w = c >>> 24) <= k);
                        ) {
                          if (re === 0) break e
                          ;(re--, (j += Y[Z++] << k), (k += 8))
                        }
                        if (B < 16) ((j >>>= w), (k -= w), (S.lens[S.have++] = B))
                        else {
                          if (B === 16) {
                            for (u = w + 2; k < u; ) {
                              if (re === 0) break e
                              ;(re--, (j += Y[Z++] << k), (k += 8))
                            }
                            if (((j >>>= w), (k -= w), S.have === 0)) {
                              ;((F.msg = 'invalid bit length repeat'), (S.mode = 30))
                              break
                            }
                            ;((f = S.lens[S.have - 1]), (te = 3 + (3 & j)), (j >>>= 2), (k -= 2))
                          } else if (B === 17) {
                            for (u = w + 3; k < u; ) {
                              if (re === 0) break e
                              ;(re--, (j += Y[Z++] << k), (k += 8))
                            }
                            ;((k -= w), (f = 0), (te = 3 + (7 & (j >>>= w))), (j >>>= 3), (k -= 3))
                          } else {
                            for (u = w + 7; k < u; ) {
                              if (re === 0) break e
                              ;(re--, (j += Y[Z++] << k), (k += 8))
                            }
                            ;((k -= w),
                              (f = 0),
                              (te = 11 + (127 & (j >>>= w))),
                              (j >>>= 7),
                              (k -= 7))
                          }
                          if (S.have + te > S.nlen + S.ndist) {
                            ;((F.msg = 'invalid bit length repeat'), (S.mode = 30))
                            break
                          }
                          for (; te--; ) S.lens[S.have++] = f
                        }
                      }
                      if (S.mode === 30) break
                      if (S.lens[256] === 0) {
                        ;((F.msg = 'invalid code -- missing end-of-block'), (S.mode = 30))
                        break
                      }
                      if (
                        ((S.lenbits = 9),
                        (_ = { bits: S.lenbits }),
                        (X = p(g, S.lens, 0, S.nlen, S.lencode, 0, S.work, _)),
                        (S.lenbits = _.bits),
                        X)
                      ) {
                        ;((F.msg = 'invalid literal/lengths set'), (S.mode = 30))
                        break
                      }
                      if (
                        ((S.distbits = 6),
                        (S.distcode = S.distdyn),
                        (_ = { bits: S.distbits }),
                        (X = p(v, S.lens, S.nlen, S.ndist, S.distcode, 0, S.work, _)),
                        (S.distbits = _.bits),
                        X)
                      ) {
                        ;((F.msg = 'invalid distances set'), (S.mode = 30))
                        break
                      }
                      if (((S.mode = 20), V === 6)) break e
                    case 20:
                      S.mode = 21
                    case 21:
                      if (6 <= re && 258 <= de) {
                        ;((F.next_out = pe),
                          (F.avail_out = de),
                          (F.next_in = Z),
                          (F.avail_in = re),
                          (S.hold = j),
                          (S.bits = k),
                          l(F, G),
                          (pe = F.next_out),
                          (le = F.output),
                          (de = F.avail_out),
                          (Z = F.next_in),
                          (Y = F.input),
                          (re = F.avail_in),
                          (j = S.hold),
                          (k = S.bits),
                          S.mode === 12 && (S.back = -1))
                        break
                      }
                      for (
                        S.back = 0;
                        (U = ((c = S.lencode[j & ((1 << S.lenbits) - 1)]) >>> 16) & 255),
                          (B = 65535 & c),
                          !((w = c >>> 24) <= k);
                      ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      if (U && !(240 & U)) {
                        for (
                          N = w, C = U, ee = B;
                          (U =
                            ((c = S.lencode[ee + ((j & ((1 << (N + C)) - 1)) >> N)]) >>> 16) & 255),
                            (B = 65535 & c),
                            !(N + (w = c >>> 24) <= k);
                        ) {
                          if (re === 0) break e
                          ;(re--, (j += Y[Z++] << k), (k += 8))
                        }
                        ;((j >>>= N), (k -= N), (S.back += N))
                      }
                      if (((j >>>= w), (k -= w), (S.back += w), (S.length = B), U === 0)) {
                        S.mode = 26
                        break
                      }
                      if (32 & U) {
                        ;((S.back = -1), (S.mode = 12))
                        break
                      }
                      if (64 & U) {
                        ;((F.msg = 'invalid literal/length code'), (S.mode = 30))
                        break
                      }
                      ;((S.extra = 15 & U), (S.mode = 22))
                    case 22:
                      if (S.extra) {
                        for (u = S.extra; k < u; ) {
                          if (re === 0) break e
                          ;(re--, (j += Y[Z++] << k), (k += 8))
                        }
                        ;((S.length += j & ((1 << S.extra) - 1)),
                          (j >>>= S.extra),
                          (k -= S.extra),
                          (S.back += S.extra))
                      }
                      ;((S.was = S.length), (S.mode = 23))
                    case 23:
                      for (
                        ;
                        (U = ((c = S.distcode[j & ((1 << S.distbits) - 1)]) >>> 16) & 255),
                          (B = 65535 & c),
                          !((w = c >>> 24) <= k);
                      ) {
                        if (re === 0) break e
                        ;(re--, (j += Y[Z++] << k), (k += 8))
                      }
                      if (!(240 & U)) {
                        for (
                          N = w, C = U, ee = B;
                          (U =
                            ((c = S.distcode[ee + ((j & ((1 << (N + C)) - 1)) >> N)]) >>> 16) &
                            255),
                            (B = 65535 & c),
                            !(N + (w = c >>> 24) <= k);
                        ) {
                          if (re === 0) break e
                          ;(re--, (j += Y[Z++] << k), (k += 8))
                        }
                        ;((j >>>= N), (k -= N), (S.back += N))
                      }
                      if (((j >>>= w), (k -= w), (S.back += w), 64 & U)) {
                        ;((F.msg = 'invalid distance code'), (S.mode = 30))
                        break
                      }
                      ;((S.offset = B), (S.extra = 15 & U), (S.mode = 24))
                    case 24:
                      if (S.extra) {
                        for (u = S.extra; k < u; ) {
                          if (re === 0) break e
                          ;(re--, (j += Y[Z++] << k), (k += 8))
                        }
                        ;((S.offset += j & ((1 << S.extra) - 1)),
                          (j >>>= S.extra),
                          (k -= S.extra),
                          (S.back += S.extra))
                      }
                      if (S.offset > S.dmax) {
                        ;((F.msg = 'invalid distance too far back'), (S.mode = 30))
                        break
                      }
                      S.mode = 25
                    case 25:
                      if (de === 0) break e
                      if (((te = G - de), S.offset > te)) {
                        if ((te = S.offset - te) > S.whave && S.sane) {
                          ;((F.msg = 'invalid distance too far back'), (S.mode = 30))
                          break
                        }
                        ;((W = te > S.wnext ? ((te -= S.wnext), S.wsize - te) : S.wnext - te),
                          te > S.length && (te = S.length),
                          (y = S.window))
                      } else ((y = le), (W = pe - S.offset), (te = S.length))
                      for (
                        de < te && (te = de), de -= te, S.length -= te;
                        (le[pe++] = y[W++]), --te;
                      );
                      S.length === 0 && (S.mode = 21)
                      break
                    case 26:
                      if (de === 0) break e
                      ;((le[pe++] = S.length), de--, (S.mode = 21))
                      break
                    case 27:
                      if (S.wrap) {
                        for (; k < 32; ) {
                          if (re === 0) break e
                          ;(re--, (j |= Y[Z++] << k), (k += 8))
                        }
                        if (
                          ((G -= de),
                          (F.total_out += G),
                          (S.total += G),
                          G &&
                            (F.adler = S.check =
                              S.flags ? o(S.check, le, G, pe - G) : a(S.check, le, G, pe - G)),
                          (G = de),
                          (S.flags ? j : m(j)) !== S.check)
                        ) {
                          ;((F.msg = 'incorrect data check'), (S.mode = 30))
                          break
                        }
                        k = j = 0
                      }
                      S.mode = 28
                    case 28:
                      if (S.wrap && S.flags) {
                        for (; k < 32; ) {
                          if (re === 0) break e
                          ;(re--, (j += Y[Z++] << k), (k += 8))
                        }
                        if (j !== (4294967295 & S.total)) {
                          ;((F.msg = 'incorrect length check'), (S.mode = 30))
                          break
                        }
                        k = j = 0
                      }
                      S.mode = 29
                    case 29:
                      X = 1
                      break e
                    case 30:
                      X = -3
                      break e
                    case 31:
                      return -4
                    case 32:
                    default:
                      return d
                  }
                return (
                  (F.next_out = pe),
                  (F.avail_out = de),
                  (F.next_in = Z),
                  (F.avail_in = re),
                  (S.hold = j),
                  (S.bits = k),
                  (S.wsize || (G !== F.avail_out && S.mode < 30 && (S.mode < 27 || V !== 4))) &&
                  he(F, F.output, F.next_out, G - F.avail_out)
                    ? ((S.mode = 31), -4)
                    : ((z -= F.avail_in),
                      (G -= F.avail_out),
                      (F.total_in += z),
                      (F.total_out += G),
                      (S.total += G),
                      S.wrap &&
                        G &&
                        (F.adler = S.check =
                          S.flags
                            ? o(S.check, le, G, F.next_out - G)
                            : a(S.check, le, G, F.next_out - G)),
                      (F.data_type =
                        S.bits +
                        (S.last ? 64 : 0) +
                        (S.mode === 12 ? 128 : 0) +
                        (S.mode === 20 || S.mode === 15 ? 256 : 0)),
                      ((z == 0 && G === 0) || V === 4) && X === E && (X = -5),
                      X)
                )
              }),
              (i.inflateEnd = function (F) {
                if (!F || !F.state) return d
                var V = F.state
                return (V.window && (V.window = null), (F.state = null), E)
              }),
              (i.inflateGetHeader = function (F, V) {
                var S
                return F && F.state && 2 & (S = F.state).wrap ? (((S.head = V).done = !1), E) : d
              }),
              (i.inflateSetDictionary = function (F, V) {
                var S,
                  Y = V.length
                return F && F.state
                  ? (S = F.state).wrap !== 0 && S.mode !== 11
                    ? d
                    : S.mode === 11 && a(1, V, Y, 0) !== S.check
                      ? -3
                      : he(F, V, Y, Y)
                        ? ((S.mode = 31), -4)
                        : ((S.havedict = 1), E)
                  : d
              }),
              (i.inflateInfo = 'pako inflate (from Nodeca project)'))
          },
          {
            '../utils/common': 41,
            './adler32': 43,
            './crc32': 45,
            './inffast': 48,
            './inftrees': 50,
          },
        ],
        50: [
          function (r, n, i) {
            var s = r('../utils/common'),
              a = [
                3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99,
                115, 131, 163, 195, 227, 258, 0, 0,
              ],
              o = [
                16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20,
                20, 20, 20, 21, 21, 21, 21, 16, 72, 78,
              ],
              l = [
                1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025,
                1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0,
              ],
              p = [
                16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25,
                25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64,
              ]
            n.exports = function (g, v, E, d, x, b, T, m) {
              var A,
                I,
                D,
                L,
                q,
                K,
                J,
                R,
                oe,
                he = m.bits,
                F = 0,
                V = 0,
                S = 0,
                Y = 0,
                le = 0,
                Z = 0,
                pe = 0,
                re = 0,
                de = 0,
                j = 0,
                k = null,
                z = 0,
                G = new s.Buf16(16),
                te = new s.Buf16(16),
                W = null,
                y = 0
              for (F = 0; F <= 15; F++) G[F] = 0
              for (V = 0; V < d; V++) G[v[E + V]]++
              for (le = he, Y = 15; 1 <= Y && G[Y] === 0; Y--);
              if ((Y < le && (le = Y), Y === 0))
                return ((x[b++] = 20971520), (x[b++] = 20971520), (m.bits = 1), 0)
              for (S = 1; S < Y && G[S] === 0; S++);
              for (le < S && (le = S), F = re = 1; F <= 15; F++)
                if (((re <<= 1), (re -= G[F]) < 0)) return -1
              if (0 < re && (g === 0 || Y !== 1)) return -1
              for (te[1] = 0, F = 1; F < 15; F++) te[F + 1] = te[F] + G[F]
              for (V = 0; V < d; V++) v[E + V] !== 0 && (T[te[v[E + V]]++] = V)
              if (
                ((K =
                  g === 0
                    ? ((k = W = T), 19)
                    : g === 1
                      ? ((k = a), (z -= 257), (W = o), (y -= 257), 256)
                      : ((k = l), (W = p), -1)),
                (F = S),
                (q = b),
                (pe = V = j = 0),
                (D = -1),
                (L = (de = 1 << (Z = le)) - 1),
                (g === 1 && 852 < de) || (g === 2 && 592 < de))
              )
                return 1
              for (;;) {
                for (
                  J = F - pe,
                    oe =
                      T[V] < K
                        ? ((R = 0), T[V])
                        : T[V] > K
                          ? ((R = W[y + T[V]]), k[z + T[V]])
                          : ((R = 96), 0),
                    A = 1 << (F - pe),
                    S = I = 1 << Z;
                  (x[q + (j >> pe) + (I -= A)] = (J << 24) | (R << 16) | oe | 0), I !== 0;
                );
                for (A = 1 << (F - 1); j & A; ) A >>= 1
                if ((A !== 0 ? ((j &= A - 1), (j += A)) : (j = 0), V++, --G[F] == 0)) {
                  if (F === Y) break
                  F = v[E + T[V]]
                }
                if (le < F && (j & L) !== D) {
                  for (
                    pe === 0 && (pe = le), q += S, re = 1 << (Z = F - pe);
                    Z + pe < Y && !((re -= G[Z + pe]) <= 0);
                  )
                    (Z++, (re <<= 1))
                  if (((de += 1 << Z), (g === 1 && 852 < de) || (g === 2 && 592 < de))) return 1
                  x[(D = j & L)] = (le << 24) | (Z << 16) | (q - b) | 0
                }
              }
              return (j !== 0 && (x[q + j] = ((F - pe) << 24) | (64 << 16) | 0), (m.bits = le), 0)
            }
          },
          { '../utils/common': 41 },
        ],
        51: [
          function (r, n, i) {
            n.exports = {
              2: 'need dictionary',
              1: 'stream end',
              0: '',
              '-1': 'file error',
              '-2': 'stream error',
              '-3': 'data error',
              '-4': 'insufficient memory',
              '-5': 'buffer error',
              '-6': 'incompatible version',
            }
          },
          {},
        ],
        52: [
          function (r, n, i) {
            var s = r('../utils/common'),
              a = 0,
              o = 1
            function l(c) {
              for (var h = c.length; 0 <= --h; ) c[h] = 0
            }
            var p = 0,
              g = 29,
              v = 256,
              E = v + 1 + g,
              d = 30,
              x = 19,
              b = 2 * E + 1,
              T = 15,
              m = 16,
              A = 7,
              I = 256,
              D = 16,
              L = 17,
              q = 18,
              K = [
                0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
                0,
              ],
              J = [
                0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11,
                12, 12, 13, 13,
              ],
              R = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7],
              oe = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
              he = new Array(2 * (E + 2))
            l(he)
            var F = new Array(2 * d)
            l(F)
            var V = new Array(512)
            l(V)
            var S = new Array(256)
            l(S)
            var Y = new Array(g)
            l(Y)
            var le,
              Z,
              pe,
              re = new Array(d)
            function de(c, h, O, H, P) {
              ;((this.static_tree = c),
                (this.extra_bits = h),
                (this.extra_base = O),
                (this.elems = H),
                (this.max_length = P),
                (this.has_stree = c && c.length))
            }
            function j(c, h) {
              ;((this.dyn_tree = c), (this.max_code = 0), (this.stat_desc = h))
            }
            function k(c) {
              return c < 256 ? V[c] : V[256 + (c >>> 7)]
            }
            function z(c, h) {
              ;((c.pending_buf[c.pending++] = 255 & h),
                (c.pending_buf[c.pending++] = (h >>> 8) & 255))
            }
            function G(c, h, O) {
              c.bi_valid > m - O
                ? ((c.bi_buf |= (h << c.bi_valid) & 65535),
                  z(c, c.bi_buf),
                  (c.bi_buf = h >> (m - c.bi_valid)),
                  (c.bi_valid += O - m))
                : ((c.bi_buf |= (h << c.bi_valid) & 65535), (c.bi_valid += O))
            }
            function te(c, h, O) {
              G(c, O[2 * h], O[2 * h + 1])
            }
            function W(c, h) {
              for (var O = 0; (O |= 1 & c), (c >>>= 1), (O <<= 1), 0 < --h; );
              return O >>> 1
            }
            function y(c, h, O) {
              var H,
                P,
                ne = new Array(T + 1),
                ue = 0
              for (H = 1; H <= T; H++) ne[H] = ue = (ue + O[H - 1]) << 1
              for (P = 0; P <= h; P++) {
                var se = c[2 * P + 1]
                se !== 0 && (c[2 * P] = W(ne[se]++, se))
              }
            }
            function w(c) {
              var h
              for (h = 0; h < E; h++) c.dyn_ltree[2 * h] = 0
              for (h = 0; h < d; h++) c.dyn_dtree[2 * h] = 0
              for (h = 0; h < x; h++) c.bl_tree[2 * h] = 0
              ;((c.dyn_ltree[2 * I] = 1),
                (c.opt_len = c.static_len = 0),
                (c.last_lit = c.matches = 0))
            }
            function U(c) {
              ;(8 < c.bi_valid
                ? z(c, c.bi_buf)
                : 0 < c.bi_valid && (c.pending_buf[c.pending++] = c.bi_buf),
                (c.bi_buf = 0),
                (c.bi_valid = 0))
            }
            function B(c, h, O, H) {
              var P = 2 * h,
                ne = 2 * O
              return c[P] < c[ne] || (c[P] === c[ne] && H[h] <= H[O])
            }
            function N(c, h, O) {
              for (
                var H = c.heap[O], P = O << 1;
                P <= c.heap_len &&
                (P < c.heap_len && B(h, c.heap[P + 1], c.heap[P], c.depth) && P++,
                !B(h, H, c.heap[P], c.depth));
              )
                ((c.heap[O] = c.heap[P]), (O = P), (P <<= 1))
              c.heap[O] = H
            }
            function C(c, h, O) {
              var H,
                P,
                ne,
                ue,
                se = 0
              if (c.last_lit !== 0)
                for (
                  ;
                  (H =
                    (c.pending_buf[c.d_buf + 2 * se] << 8) | c.pending_buf[c.d_buf + 2 * se + 1]),
                    (P = c.pending_buf[c.l_buf + se]),
                    se++,
                    H === 0
                      ? te(c, P, h)
                      : (te(c, (ne = S[P]) + v + 1, h),
                        (ue = K[ne]) !== 0 && G(c, (P -= Y[ne]), ue),
                        te(c, (ne = k(--H)), O),
                        (ue = J[ne]) !== 0 && G(c, (H -= re[ne]), ue)),
                    se < c.last_lit;
                );
              te(c, I, h)
            }
            function ee(c, h) {
              var O,
                H,
                P,
                ne = h.dyn_tree,
                ue = h.stat_desc.static_tree,
                se = h.stat_desc.has_stree,
                fe = h.stat_desc.elems,
                me = -1
              for (c.heap_len = 0, c.heap_max = b, O = 0; O < fe; O++)
                ne[2 * O] !== 0
                  ? ((c.heap[++c.heap_len] = me = O), (c.depth[O] = 0))
                  : (ne[2 * O + 1] = 0)
              for (; c.heap_len < 2; )
                ((ne[2 * (P = c.heap[++c.heap_len] = me < 2 ? ++me : 0)] = 1),
                  (c.depth[P] = 0),
                  c.opt_len--,
                  se && (c.static_len -= ue[2 * P + 1]))
              for (h.max_code = me, O = c.heap_len >> 1; 1 <= O; O--) N(c, ne, O)
              for (
                P = fe;
                (O = c.heap[1]),
                  (c.heap[1] = c.heap[c.heap_len--]),
                  N(c, ne, 1),
                  (H = c.heap[1]),
                  (c.heap[--c.heap_max] = O),
                  (c.heap[--c.heap_max] = H),
                  (ne[2 * P] = ne[2 * O] + ne[2 * H]),
                  (c.depth[P] = (c.depth[O] >= c.depth[H] ? c.depth[O] : c.depth[H]) + 1),
                  (ne[2 * O + 1] = ne[2 * H + 1] = P),
                  (c.heap[1] = P++),
                  N(c, ne, 1),
                  2 <= c.heap_len;
              );
              ;((c.heap[--c.heap_max] = c.heap[1]),
                (function (we, Pe) {
                  var Ct,
                    rt,
                    vr,
                    Re,
                    jr,
                    Jn,
                    _t = Pe.dyn_tree,
                    Jc = Pe.max_code,
                    rp = Pe.stat_desc.static_tree,
                    np = Pe.stat_desc.has_stree,
                    ip = Pe.stat_desc.extra_bits,
                    Qc = Pe.stat_desc.extra_base,
                    _r = Pe.stat_desc.max_length,
                    Gr = 0
                  for (Re = 0; Re <= T; Re++) we.bl_count[Re] = 0
                  for (_t[2 * we.heap[we.heap_max] + 1] = 0, Ct = we.heap_max + 1; Ct < b; Ct++)
                    (_r < (Re = _t[2 * _t[2 * (rt = we.heap[Ct]) + 1] + 1] + 1) &&
                      ((Re = _r), Gr++),
                      (_t[2 * rt + 1] = Re),
                      Jc < rt ||
                        (we.bl_count[Re]++,
                        (jr = 0),
                        Qc <= rt && (jr = ip[rt - Qc]),
                        (Jn = _t[2 * rt]),
                        (we.opt_len += Jn * (Re + jr)),
                        np && (we.static_len += Jn * (rp[2 * rt + 1] + jr))))
                  if (Gr !== 0) {
                    do {
                      for (Re = _r - 1; we.bl_count[Re] === 0; ) Re--
                      ;(we.bl_count[Re]--, (we.bl_count[Re + 1] += 2), we.bl_count[_r]--, (Gr -= 2))
                    } while (0 < Gr)
                    for (Re = _r; Re !== 0; Re--)
                      for (rt = we.bl_count[Re]; rt !== 0; )
                        Jc < (vr = we.heap[--Ct]) ||
                          (_t[2 * vr + 1] !== Re &&
                            ((we.opt_len += (Re - _t[2 * vr + 1]) * _t[2 * vr]),
                            (_t[2 * vr + 1] = Re)),
                          rt--)
                  }
                })(c, h),
                y(ne, me, c.bl_count))
            }
            function f(c, h, O) {
              var H,
                P,
                ne = -1,
                ue = h[1],
                se = 0,
                fe = 7,
                me = 4
              for (
                ue === 0 && ((fe = 138), (me = 3)), h[2 * (O + 1) + 1] = 65535, H = 0;
                H <= O;
                H++
              )
                ((P = ue),
                  (ue = h[2 * (H + 1) + 1]),
                  (++se < fe && P === ue) ||
                    (se < me
                      ? (c.bl_tree[2 * P] += se)
                      : P !== 0
                        ? (P !== ne && c.bl_tree[2 * P]++, c.bl_tree[2 * D]++)
                        : se <= 10
                          ? c.bl_tree[2 * L]++
                          : c.bl_tree[2 * q]++,
                    (ne = P),
                    (me =
                      (se = 0) === ue
                        ? ((fe = 138), 3)
                        : P === ue
                          ? ((fe = 6), 3)
                          : ((fe = 7), 4))))
            }
            function X(c, h, O) {
              var H,
                P,
                ne = -1,
                ue = h[1],
                se = 0,
                fe = 7,
                me = 4
              for (ue === 0 && ((fe = 138), (me = 3)), H = 0; H <= O; H++)
                if (((P = ue), (ue = h[2 * (H + 1) + 1]), !(++se < fe && P === ue))) {
                  if (se < me) for (; te(c, P, c.bl_tree), --se != 0; );
                  else
                    P !== 0
                      ? (P !== ne && (te(c, P, c.bl_tree), se--),
                        te(c, D, c.bl_tree),
                        G(c, se - 3, 2))
                      : se <= 10
                        ? (te(c, L, c.bl_tree), G(c, se - 3, 3))
                        : (te(c, q, c.bl_tree), G(c, se - 11, 7))
                  ;((ne = P),
                    (me =
                      (se = 0) === ue ? ((fe = 138), 3) : P === ue ? ((fe = 6), 3) : ((fe = 7), 4)))
                }
            }
            l(re)
            var _ = !1
            function u(c, h, O, H) {
              ;(G(c, (p << 1) + (H ? 1 : 0), 3),
                (function (P, ne, ue, se) {
                  ;(U(P),
                    z(P, ue),
                    z(P, ~ue),
                    s.arraySet(P.pending_buf, P.window, ne, ue, P.pending),
                    (P.pending += ue))
                })(c, h, O))
            }
            ;((i._tr_init = function (c) {
              ;(_ ||
                ((function () {
                  var h,
                    O,
                    H,
                    P,
                    ne,
                    ue = new Array(T + 1)
                  for (P = H = 0; P < g - 1; P++)
                    for (Y[P] = H, h = 0; h < 1 << K[P]; h++) S[H++] = P
                  for (S[H - 1] = P, P = ne = 0; P < 16; P++)
                    for (re[P] = ne, h = 0; h < 1 << J[P]; h++) V[ne++] = P
                  for (ne >>= 7; P < d; P++)
                    for (re[P] = ne << 7, h = 0; h < 1 << (J[P] - 7); h++) V[256 + ne++] = P
                  for (O = 0; O <= T; O++) ue[O] = 0
                  for (h = 0; h <= 143; ) ((he[2 * h + 1] = 8), h++, ue[8]++)
                  for (; h <= 255; ) ((he[2 * h + 1] = 9), h++, ue[9]++)
                  for (; h <= 279; ) ((he[2 * h + 1] = 7), h++, ue[7]++)
                  for (; h <= 287; ) ((he[2 * h + 1] = 8), h++, ue[8]++)
                  for (y(he, E + 1, ue), h = 0; h < d; h++)
                    ((F[2 * h + 1] = 5), (F[2 * h] = W(h, 5)))
                  ;((le = new de(he, K, v + 1, E, T)),
                    (Z = new de(F, J, 0, d, T)),
                    (pe = new de(new Array(0), R, 0, x, A)))
                })(),
                (_ = !0)),
                (c.l_desc = new j(c.dyn_ltree, le)),
                (c.d_desc = new j(c.dyn_dtree, Z)),
                (c.bl_desc = new j(c.bl_tree, pe)),
                (c.bi_buf = 0),
                (c.bi_valid = 0),
                w(c))
            }),
              (i._tr_stored_block = u),
              (i._tr_flush_block = function (c, h, O, H) {
                var P,
                  ne,
                  ue = 0
                ;(0 < c.level
                  ? (c.strm.data_type === 2 &&
                      (c.strm.data_type = (function (se) {
                        var fe,
                          me = 4093624447
                        for (fe = 0; fe <= 31; fe++, me >>>= 1)
                          if (1 & me && se.dyn_ltree[2 * fe] !== 0) return a
                        if (
                          se.dyn_ltree[18] !== 0 ||
                          se.dyn_ltree[20] !== 0 ||
                          se.dyn_ltree[26] !== 0
                        )
                          return o
                        for (fe = 32; fe < v; fe++) if (se.dyn_ltree[2 * fe] !== 0) return o
                        return a
                      })(c)),
                    ee(c, c.l_desc),
                    ee(c, c.d_desc),
                    (ue = (function (se) {
                      var fe
                      for (
                        f(se, se.dyn_ltree, se.l_desc.max_code),
                          f(se, se.dyn_dtree, se.d_desc.max_code),
                          ee(se, se.bl_desc),
                          fe = x - 1;
                        3 <= fe && se.bl_tree[2 * oe[fe] + 1] === 0;
                        fe--
                      );
                      return ((se.opt_len += 3 * (fe + 1) + 5 + 5 + 4), fe)
                    })(c)),
                    (P = (c.opt_len + 3 + 7) >>> 3),
                    (ne = (c.static_len + 3 + 7) >>> 3) <= P && (P = ne))
                  : (P = ne = O + 5),
                  O + 4 <= P && h !== -1
                    ? u(c, h, O, H)
                    : c.strategy === 4 || ne === P
                      ? (G(c, 2 + (H ? 1 : 0), 3), C(c, he, F))
                      : (G(c, 4 + (H ? 1 : 0), 3),
                        (function (se, fe, me, we) {
                          var Pe
                          for (
                            G(se, fe - 257, 5), G(se, me - 1, 5), G(se, we - 4, 4), Pe = 0;
                            Pe < we;
                            Pe++
                          )
                            G(se, se.bl_tree[2 * oe[Pe] + 1], 3)
                          ;(X(se, se.dyn_ltree, fe - 1), X(se, se.dyn_dtree, me - 1))
                        })(c, c.l_desc.max_code + 1, c.d_desc.max_code + 1, ue + 1),
                        C(c, c.dyn_ltree, c.dyn_dtree)),
                  w(c),
                  H && U(c))
              }),
              (i._tr_tally = function (c, h, O) {
                return (
                  (c.pending_buf[c.d_buf + 2 * c.last_lit] = (h >>> 8) & 255),
                  (c.pending_buf[c.d_buf + 2 * c.last_lit + 1] = 255 & h),
                  (c.pending_buf[c.l_buf + c.last_lit] = 255 & O),
                  c.last_lit++,
                  h === 0
                    ? c.dyn_ltree[2 * O]++
                    : (c.matches++,
                      h--,
                      c.dyn_ltree[2 * (S[O] + v + 1)]++,
                      c.dyn_dtree[2 * k(h)]++),
                  c.last_lit === c.lit_bufsize - 1
                )
              }),
              (i._tr_align = function (c) {
                ;(G(c, 2, 3),
                  te(c, I, he),
                  (function (h) {
                    h.bi_valid === 16
                      ? (z(h, h.bi_buf), (h.bi_buf = 0), (h.bi_valid = 0))
                      : 8 <= h.bi_valid &&
                        ((h.pending_buf[h.pending++] = 255 & h.bi_buf),
                        (h.bi_buf >>= 8),
                        (h.bi_valid -= 8))
                  })(c))
              }))
          },
          { '../utils/common': 41 },
        ],
        53: [
          function (r, n, i) {
            n.exports = function () {
              ;((this.input = null),
                (this.next_in = 0),
                (this.avail_in = 0),
                (this.total_in = 0),
                (this.output = null),
                (this.next_out = 0),
                (this.avail_out = 0),
                (this.total_out = 0),
                (this.msg = ''),
                (this.state = null),
                (this.data_type = 2),
                (this.adler = 0))
            }
          },
          {},
        ],
        54: [
          function (r, n, i) {
            ;(function (s) {
              ;(function (a, o) {
                if (!a.setImmediate) {
                  var l,
                    p,
                    g,
                    v,
                    E = 1,
                    d = {},
                    x = !1,
                    b = a.document,
                    T = Object.getPrototypeOf && Object.getPrototypeOf(a)
                  ;((T = T && T.setTimeout ? T : a),
                    (l =
                      {}.toString.call(a.process) === '[object process]'
                        ? function (D) {
                            _e.nextTick(function () {
                              A(D)
                            })
                          }
                        : (function () {
                              if (a.postMessage && !a.importScripts) {
                                var D = !0,
                                  L = a.onmessage
                                return (
                                  (a.onmessage = function () {
                                    D = !1
                                  }),
                                  a.postMessage('', '*'),
                                  (a.onmessage = L),
                                  D
                                )
                              }
                            })()
                          ? ((v = 'setImmediate$' + Math.random() + '$'),
                            a.addEventListener
                              ? a.addEventListener('message', I, !1)
                              : a.attachEvent('onmessage', I),
                            function (D) {
                              a.postMessage(v + D, '*')
                            })
                          : a.MessageChannel
                            ? (((g = new MessageChannel()).port1.onmessage = function (D) {
                                A(D.data)
                              }),
                              function (D) {
                                g.port2.postMessage(D)
                              })
                            : b && 'onreadystatechange' in b.createElement('script')
                              ? ((p = b.documentElement),
                                function (D) {
                                  var L = b.createElement('script')
                                  ;((L.onreadystatechange = function () {
                                    ;(A(D),
                                      (L.onreadystatechange = null),
                                      p.removeChild(L),
                                      (L = null))
                                  }),
                                    p.appendChild(L))
                                })
                              : function (D) {
                                  setTimeout(A, 0, D)
                                }),
                    (T.setImmediate = function (D) {
                      typeof D != 'function' && (D = new Function('' + D))
                      for (var L = new Array(arguments.length - 1), q = 0; q < L.length; q++)
                        L[q] = arguments[q + 1]
                      var K = { callback: D, args: L }
                      return ((d[E] = K), l(E), E++)
                    }),
                    (T.clearImmediate = m))
                }
                function m(D) {
                  delete d[D]
                }
                function A(D) {
                  if (x) setTimeout(A, 0, D)
                  else {
                    var L = d[D]
                    if (L) {
                      x = !0
                      try {
                        ;(function (q) {
                          var K = q.callback,
                            J = q.args
                          switch (J.length) {
                            case 0:
                              K()
                              break
                            case 1:
                              K(J[0])
                              break
                            case 2:
                              K(J[0], J[1])
                              break
                            case 3:
                              K(J[0], J[1], J[2])
                              break
                            default:
                              K.apply(o, J)
                          }
                        })(L)
                      } finally {
                        ;(m(D), (x = !1))
                      }
                    }
                  }
                }
                function I(D) {
                  D.source === a &&
                    typeof D.data == 'string' &&
                    D.data.indexOf(v) === 0 &&
                    A(+D.data.slice(v.length))
                }
              })(typeof self > 'u' ? (s === void 0 ? this : s) : self)
            }).call(
              this,
              typeof ct < 'u' ? ct : typeof self < 'u' ? self : typeof window < 'u' ? window : {},
            )
          },
          {},
        ],
      },
      {},
      [10],
    )(10)
  })
})(Yd)
var tg = Yd.exports,
  Un = Fc(tg),
  Mn = { exports: {} },
  rg = { '&': '&amp;', '"': '&quot;', "'": '&apos;', '<': '&lt;', '>': '&gt;' }
function ng(t) {
  return t && t.replace
    ? t.replace(/([&"<>'])/g, function (e, r) {
        return rg[r]
      })
    : t
}
var ig = ng,
  kc = ig,
  If = Wc.Stream,
  sg = '    '
function og(t, e) {
  typeof e != 'object' && (e = { indent: e })
  var r = e.stream ? new If() : null,
    n = '',
    i = !1,
    s = e.indent ? (e.indent === !0 ? sg : e.indent) : '',
    a = !0
  function o(E) {
    a ? _e.nextTick(E) : E()
  }
  function l(E, d) {
    if ((d !== void 0 && (n += d), E && !i && ((r = r || new If()), (i = !0)), E && i)) {
      var x = n
      ;(o(function () {
        r.emit('data', x)
      }),
        (n = ''))
    }
  }
  function p(E, d) {
    Yc(l, Hn(E, s, s ? 1 : 0), d)
  }
  function g() {
    if (r) {
      var E = n
      o(function () {
        ;(r.emit('data', E), r.emit('end'), (r.readable = !1), r.emit('close'))
      })
    }
  }
  function v(E) {
    var d = E.encoding || 'UTF-8',
      x = { version: '1.0', encoding: d }
    ;(E.standalone && (x.standalone = E.standalone),
      p({ '?xml': { _attr: x } }),
      (n = n.replace('/>', '?>')))
  }
  return (
    o(function () {
      a = !1
    }),
    e.declaration && v(e.declaration),
    t && t.forEach
      ? t.forEach(function (E, d) {
          var x
          ;(d + 1 === t.length && (x = g), p(E, x))
        })
      : p(t, g),
    r ? ((r.readable = !0), r) : n
  )
}
function ag() {
  var t = Array.prototype.slice.call(arguments),
    e = { _elem: Hn(t) }
  return (
    (e.push = function (r) {
      if (!this.append) throw new Error('not assigned to a parent!')
      var n = this,
        i = this._elem.indent
      Yc(this.append, Hn(r, i, this._elem.icount + (i ? 1 : 0)), function () {
        n.append(!0)
      })
    }),
    (e.close = function (r) {
      ;(r !== void 0 && this.push(r), this.end && this.end())
    }),
    e
  )
}
function ug(t, e) {
  return new Array(e || 0).join(t || '')
}
function Hn(t, e, r) {
  r = r || 0
  var n = ug(e, r),
    i,
    s = t,
    a = !1
  if (typeof t == 'object') {
    var o = Object.keys(t)
    if (((i = o[0]), (s = t[i]), s && s._elem))
      return (
        (s._elem.name = i),
        (s._elem.icount = r),
        (s._elem.indent = e),
        (s._elem.indents = n),
        (s._elem.interrupt = s),
        s._elem
      )
  }
  var l = [],
    p = [],
    g
  function v(E) {
    var d = Object.keys(E)
    d.forEach(function (x) {
      l.push(cg(x, E[x]))
    })
  }
  switch (typeof s) {
    case 'object':
      if (s === null) break
      ;(s._attr && v(s._attr),
        s._cdata && p.push(('<![CDATA[' + s._cdata).replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>'),
        s.forEach &&
          ((g = !1),
          p.push(''),
          s.forEach(function (E) {
            if (typeof E == 'object') {
              var d = Object.keys(E)[0]
              d == '_attr' ? v(E._attr) : p.push(Hn(E, e, r + 1))
            } else (p.pop(), (g = !0), p.push(kc(E)))
          }),
          g || p.push('')))
      break
    default:
      p.push(kc(s))
  }
  return { name: i, interrupt: a, attributes: l, content: p, icount: r, indents: n, indent: e }
}
function Yc(t, e, r) {
  if (typeof e != 'object') return t(!1, e)
  var n = e.interrupt ? 1 : e.content.length
  function i() {
    for (; e.content.length; ) {
      var a = e.content.shift()
      if (a !== void 0) {
        if (s(a)) return
        Yc(t, a)
      }
    }
    ;(t(
      !1,
      (n > 1 ? e.indents : '') +
        (e.name ? '</' + e.name + '>' : '') +
        (e.indent && !r
          ? `
`
          : ''),
    ),
      r && r())
  }
  function s(a) {
    return a.interrupt
      ? ((a.interrupt.append = t), (a.interrupt.end = i), (a.interrupt = !1), t(!0), !0)
      : !1
  }
  if (
    (t(
      !1,
      e.indents +
        (e.name ? '<' + e.name : '') +
        (e.attributes.length ? ' ' + e.attributes.join(' ') : '') +
        (n ? (e.name ? '>' : '') : e.name ? '/>' : '') +
        (e.indent && n > 1
          ? `
`
          : ''),
    ),
    !n)
  )
    return t(
      !1,
      e.indent
        ? `
`
        : '',
    )
  s(e) || i()
}
function cg(t, e) {
  return t + '="' + kc(e) + '"'
}
Mn.exports = og
Mn.exports.element = Mn.exports.Element = ag
var lg = Mn.exports,
  Se = Fc(lg),
  Rf = 0,
  Nf = 32,
  hg = 32,
  fg = (t, e) => {
    let r = e.replace(/-/g, '')
    if (r.length !== hg) throw new Error(`Error: Cannot extract GUID from font filename: ${e}`)
    let i = r
      .replace(/(..)/g, '$1 ')
      .trim()
      .split(' ')
      .map((l) => parseInt(l, 16))
    i.reverse()
    let a = t.slice(Rf, Nf).map((l, p) => l ^ i[p % i.length])
    return Buffer.concat([t.slice(0, Rf), a, t.slice(Nf)])
  },
  Hr = class {
    format(e, r = { stack: [] }) {
      let n = e.prepForXml(r)
      if (n) return n
      throw Error('XMLComponent did not format correctly')
    }
  },
  Wn = class {
    replace(e, r, n) {
      let i = e
      return (
        r.forEach((s, a) => {
          i = i.replace(new RegExp(`{${s.fileName}}`, 'g'), (n + a).toString())
        }),
        i
      )
    }
    getMediaData(e, r) {
      return r.Array.filter((n) => e.search(`{${n.fileName}}`) > 0)
    }
  },
  Cc = class {
    replace(e, r) {
      let n = e
      for (let i of r)
        n = n.replace(new RegExp(`{${i.reference}-${i.instance}}`, 'g'), i.numId.toString())
      return n
    }
  },
  Oc = class {
    constructor() {
      ;($(this, 'formatter'),
        $(this, 'imageReplacer'),
        $(this, 'numberingReplacer'),
        (this.formatter = new Hr()),
        (this.imageReplacer = new Wn()),
        (this.numberingReplacer = new Cc()))
    }
    compile(e, r) {
      let n = new Un(),
        i = this.xmlifyFile(e, r),
        s = new Map(Object.entries(i))
      for (let [, a] of s)
        if (Array.isArray(a)) for (let o of a) n.file(o.path, o.data)
        else n.file(a.path, a.data)
      for (let a of e.Media.Array)
        a.type !== 'svg'
          ? n.file(`word/media/${a.fileName}`, a.data)
          : (n.file(`word/media/${a.fileName}`, a.data),
            n.file(`word/media/${a.fallback.fileName}`, a.fallback.data))
      for (let { data: a, name: o, fontKey: l } of e.FontTable.fontOptionsWithKey) {
        let [p] = o.split('.')
        n.file(`word/fonts/${p}.odttf`, fg(a, l))
      }
      return n
    }
    xmlifyFile(e, r) {
      let n = e.Document.Relationships.RelationshipCount + 1,
        i = Se(
          this.formatter.format(e.Document.View, { viewWrapper: e.Document, file: e, stack: [] }),
          { indent: r, declaration: { standalone: 'yes', encoding: 'UTF-8' } },
        ),
        s = this.imageReplacer.getMediaData(i, e.Media)
      return {
        Relationships: {
          data:
            (s.forEach((a, o) => {
              e.Document.Relationships.createRelationship(
                n + o,
                'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
                `media/${a.fileName}`,
              )
            }),
            Se(
              this.formatter.format(e.Document.Relationships, {
                viewWrapper: e.Document,
                file: e,
                stack: [],
              }),
              { indent: r, declaration: { encoding: 'UTF-8' } },
            )),
          path: 'word/_rels/document.xml.rels',
        },
        Document: {
          data: (() => {
            let a = this.imageReplacer.replace(i, s, n)
            return this.numberingReplacer.replace(a, e.Numbering.ConcreteNumbering)
          })(),
          path: 'word/document.xml',
        },
        Styles: {
          data: (() => {
            let a = Se(
              this.formatter.format(e.Styles, { viewWrapper: e.Document, file: e, stack: [] }),
              { indent: r, declaration: { standalone: 'yes', encoding: 'UTF-8' } },
            )
            return this.numberingReplacer.replace(a, e.Numbering.ConcreteNumbering)
          })(),
          path: 'word/styles.xml',
        },
        Properties: {
          data: Se(
            this.formatter.format(e.CoreProperties, {
              viewWrapper: e.Document,
              file: e,
              stack: [],
            }),
            { indent: r, declaration: { standalone: 'yes', encoding: 'UTF-8' } },
          ),
          path: 'docProps/core.xml',
        },
        Numbering: {
          data: Se(
            this.formatter.format(e.Numbering, { viewWrapper: e.Document, file: e, stack: [] }),
            { indent: r, declaration: { standalone: 'yes', encoding: 'UTF-8' } },
          ),
          path: 'word/numbering.xml',
        },
        FileRelationships: {
          data: Se(
            this.formatter.format(e.FileRelationships, {
              viewWrapper: e.Document,
              file: e,
              stack: [],
            }),
            { indent: r, declaration: { encoding: 'UTF-8' } },
          ),
          path: '_rels/.rels',
        },
        HeaderRelationships: e.Headers.map((a, o) => {
          let l = Se(this.formatter.format(a.View, { viewWrapper: a, file: e, stack: [] }), {
            indent: r,
            declaration: { encoding: 'UTF-8' },
          })
          return (
            this.imageReplacer.getMediaData(l, e.Media).forEach((g, v) => {
              a.Relationships.createRelationship(
                v,
                'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
                `media/${g.fileName}`,
              )
            }),
            {
              data: Se(
                this.formatter.format(a.Relationships, { viewWrapper: a, file: e, stack: [] }),
                { indent: r, declaration: { encoding: 'UTF-8' } },
              ),
              path: `word/_rels/header${o + 1}.xml.rels`,
            }
          )
        }),
        FooterRelationships: e.Footers.map((a, o) => {
          let l = Se(this.formatter.format(a.View, { viewWrapper: a, file: e, stack: [] }), {
            indent: r,
            declaration: { encoding: 'UTF-8' },
          })
          return (
            this.imageReplacer.getMediaData(l, e.Media).forEach((g, v) => {
              a.Relationships.createRelationship(
                v,
                'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
                `media/${g.fileName}`,
              )
            }),
            {
              data: Se(
                this.formatter.format(a.Relationships, { viewWrapper: a, file: e, stack: [] }),
                { indent: r, declaration: { encoding: 'UTF-8' } },
              ),
              path: `word/_rels/footer${o + 1}.xml.rels`,
            }
          )
        }),
        Headers: e.Headers.map((a, o) => {
          let l = Se(this.formatter.format(a.View, { viewWrapper: a, file: e, stack: [] }), {
              indent: r,
              declaration: { encoding: 'UTF-8' },
            }),
            p = this.imageReplacer.getMediaData(l, e.Media),
            g = this.imageReplacer.replace(l, p, 0)
          return {
            data: this.numberingReplacer.replace(g, e.Numbering.ConcreteNumbering),
            path: `word/header${o + 1}.xml`,
          }
        }),
        Footers: e.Footers.map((a, o) => {
          let l = Se(this.formatter.format(a.View, { viewWrapper: a, file: e, stack: [] }), {
              indent: r,
              declaration: { encoding: 'UTF-8' },
            }),
            p = this.imageReplacer.getMediaData(l, e.Media),
            g = this.imageReplacer.replace(l, p, 0)
          return {
            data: this.numberingReplacer.replace(g, e.Numbering.ConcreteNumbering),
            path: `word/footer${o + 1}.xml`,
          }
        }),
        ContentTypes: {
          data: Se(
            this.formatter.format(e.ContentTypes, { viewWrapper: e.Document, file: e, stack: [] }),
            { indent: r, declaration: { encoding: 'UTF-8' } },
          ),
          path: '[Content_Types].xml',
        },
        CustomProperties: {
          data: Se(
            this.formatter.format(e.CustomProperties, {
              viewWrapper: e.Document,
              file: e,
              stack: [],
            }),
            { indent: r, declaration: { standalone: 'yes', encoding: 'UTF-8' } },
          ),
          path: 'docProps/custom.xml',
        },
        AppProperties: {
          data: Se(
            this.formatter.format(e.AppProperties, { viewWrapper: e.Document, file: e, stack: [] }),
            { indent: r, declaration: { standalone: 'yes', encoding: 'UTF-8' } },
          ),
          path: 'docProps/app.xml',
        },
        FootNotes: {
          data: Se(
            this.formatter.format(e.FootNotes.View, {
              viewWrapper: e.FootNotes,
              file: e,
              stack: [],
            }),
            { indent: r, declaration: { encoding: 'UTF-8' } },
          ),
          path: 'word/footnotes.xml',
        },
        FootNotesRelationships: {
          data: Se(
            this.formatter.format(e.FootNotes.Relationships, {
              viewWrapper: e.FootNotes,
              file: e,
              stack: [],
            }),
            { indent: r, declaration: { encoding: 'UTF-8' } },
          ),
          path: 'word/_rels/footnotes.xml.rels',
        },
        Settings: {
          data: Se(
            this.formatter.format(e.Settings, { viewWrapper: e.Document, file: e, stack: [] }),
            { indent: r, declaration: { standalone: 'yes', encoding: 'UTF-8' } },
          ),
          path: 'word/settings.xml',
        },
        Comments: {
          data: Se(
            this.formatter.format(e.Comments, { viewWrapper: e.Document, file: e, stack: [] }),
            { indent: r, declaration: { standalone: 'yes', encoding: 'UTF-8' } },
          ),
          path: 'word/comments.xml',
        },
        FontTable: {
          data: Se(
            this.formatter.format(e.FontTable.View, {
              viewWrapper: e.Document,
              file: e,
              stack: [],
            }),
            { indent: r, declaration: { standalone: 'yes', encoding: 'UTF-8' } },
          ),
          path: 'word/fontTable.xml',
        },
        FontTableRelationships: {
          data: Se(
            this.formatter.format(e.FontTable.Relationships, {
              viewWrapper: e.Document,
              file: e,
              stack: [],
            }),
            { indent: r, declaration: { encoding: 'UTF-8' } },
          ),
          path: 'word/_rels/fontTable.xml.rels',
        },
      }
    }
  },
  dg = { NONE: '', WITH_2_BLANKS: '  ', WITH_4_BLANKS: '    ', WITH_TAB: '	' },
  Sr = (t) => (t === !0 ? dg.WITH_2_BLANKS : t === !1 ? void 0 : t),
  Dc = class {
    static toString(e, r) {
      return Zt(this, null, function* () {
        return yield this.compiler.compile(e, Sr(r)).generateAsync({
          type: 'string',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          compression: 'DEFLATE',
        })
      })
    }
    static toBuffer(e, r) {
      return Zt(this, null, function* () {
        return yield this.compiler.compile(e, Sr(r)).generateAsync({
          type: 'nodebuffer',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          compression: 'DEFLATE',
        })
      })
    }
    static toBase64String(e, r) {
      return Zt(this, null, function* () {
        return yield this.compiler.compile(e, Sr(r)).generateAsync({
          type: 'base64',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          compression: 'DEFLATE',
        })
      })
    }
    static toBlob(e, r) {
      return Zt(this, null, function* () {
        return yield this.compiler.compile(e, Sr(r)).generateAsync({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          compression: 'DEFLATE',
        })
      })
    }
    static toStream(e, r) {
      let n = new Wc.Stream()
      return (
        this.compiler
          .compile(e, Sr(r))
          .generateAsync({
            type: 'nodebuffer',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            compression: 'DEFLATE',
          })
          .then((s) => {
            ;(n.emit('data', s), n.emit('end'))
          }),
        n
      )
    }
  }
$(Dc, 'compiler', new Oc())
var pg = new Hr(),
  Zn = (t) => Kn.xml2js(t, { compact: !1, captureSpacesBetweenElements: !0 }),
  Zd = (t) => {
    var e
    return (e = Zn(Se(pg.format(new or({ text: t })))).elements[0].elements) != null ? e : []
  },
  Jd = (t) => Ue(ye({}, t), { attributes: { 'xml:space': 'preserve' } }),
  Zc = (t, e) => {
    var r, n
    return (n = (r = t.elements) == null ? void 0 : r.filter((i) => i.name === e)[0].elements) !=
      null
      ? n
      : []
  },
  Ir = { START: 0, MIDDLE: 1, END: 2 },
  mg = ({ paragraphElement: t, renderedParagraph: e, originalText: r, replacementText: n }) => {
    let i = e.text.indexOf(r),
      s = i + r.length - 1,
      a = Ir.START
    for (let o of e.runs)
      for (let { text: l, index: p, start: g, end: v } of o.parts)
        switch (a) {
          case Ir.START:
            if (i >= g) {
              let E = i - g,
                d = Math.min(s, v) - g,
                x = o.text.substring(E, d + 1)
              if (x === '') continue
              let b = l.replace(x, n)
              ;(ts(t.elements[o.index].elements[p], b), (a = Ir.MIDDLE))
              continue
            }
            break
          case Ir.MIDDLE:
            if (s <= v) {
              let E = l.substring(s - g + 1)
              ts(t.elements[o.index].elements[p], E)
              let d = t.elements[o.index].elements[p]
              ;((t.elements[o.index].elements[p] = Jd(d)), (a = Ir.END))
            } else ts(t.elements[o.index].elements[p], '')
            break
        }
    return t
  },
  ts = (t, e) => ((t.elements = Zd(e)), t),
  wg = (t, e) => {
    var r, n, i, s
    for (let a = 0; a < ((r = t.elements) != null ? r : []).length; a++) {
      let o = t.elements[a]
      if (o.type === 'element' && o.name === 'w:r') {
        let l = ((n = o.elements) != null ? n : []).filter(
          (p) => p.type === 'element' && p.name === 'w:t',
        )
        for (let p of l)
          if ((i = p.elements) != null && i[0] && (s = p.elements[0].text) != null && s.includes(e))
            return a
      }
    }
    throw new Error('Token not found')
  },
  gg = (t, e) => {
    var r, n
    let i = 0,
      s =
        (n =
          (r = t.elements) == null
            ? void 0
            : r
                .map((l, p) => {
                  var g, v, E
                  if (l.type === 'element' && l.name === 'w:t') {
                    let b = (
                      (E =
                        (v = (g = l.elements) == null ? void 0 : g[0]) == null ? void 0 : v.text) !=
                      null
                        ? E
                        : ''
                    )
                      .split(e)
                      .map((T) => Ue(ye(ye({}, l), Jd(l)), { elements: Zd(T) }))
                    return ((i = p), b)
                  } else return l
                })
                .flat()) != null
          ? n
          : [],
      a = Ue(ye({}, JSON.parse(JSON.stringify(t))), { elements: s.slice(0, i + 1) }),
      o = Ue(ye({}, JSON.parse(JSON.stringify(t))), { elements: s.slice(i + 1) })
    return { left: a, right: o }
  },
  yg = (t) => {
    if (t.element.name !== 'w:p') throw new Error(`Invalid node type: ${t.element.name}`)
    if (!t.element.elements) return { text: '', runs: [], index: -1, pathToParagraph: [] }
    let e = 0,
      r = t.element.elements
        .map((i, s) => ({ element: i, i: s }))
        .filter(({ element: i }) => i.name === 'w:r')
        .map(({ element: i, i: s }) => {
          let a = vg(i, s, e)
          return ((e += a.text.length), a)
        })
        .filter((i) => !!i)
    return {
      text: r.reduce((i, s) => i + s.text, ''),
      runs: r,
      index: t.index,
      pathToParagraph: Qd(t),
    }
  },
  vg = (t, e, r) => {
    if (!t.elements) return { text: '', parts: [], index: -1, start: r, end: r }
    let n = r,
      i = t.elements
        .map((a, o) => {
          var l, p
          return a.name === 'w:t' && a.elements && a.elements.length > 0
            ? {
                text:
                  (p = (l = a.elements[0].text) == null ? void 0 : l.toString()) != null ? p : '',
                index: o,
                start: n,
                end: (() => {
                  var g, v
                  return (
                    (n +=
                      ((v = (g = a.elements[0].text) == null ? void 0 : g.toString()) != null
                        ? v
                        : ''
                      ).length - 1),
                    n
                  )
                })(),
              }
            : void 0
        })
        .filter((a) => !!a)
        .map((a) => a)
    return { text: i.reduce((a, o) => a + o.text, ''), parts: i, index: e, start: r, end: n }
  },
  Qd = (t) => (t.parent ? [...Qd(t.parent), t.index] : [t.index]),
  kf = (t) => {
    var e, r
    return (r =
      (e = t.element.elements) == null
        ? void 0
        : e.map((n, i) => ({ element: n, index: i, parent: t }))) != null
      ? r
      : []
  },
  ep = (t) => {
    let e = [],
      r = [...kf({ element: t, index: 0, parent: void 0 })],
      n
    for (; r.length > 0; )
      ((n = r.shift()), n.element.name === 'w:p' ? (e = [...e, yg(n)]) : r.push(...kf(n)))
    return e
  },
  _g = (t, e) => ep(t).filter((r) => r.text.includes(e)),
  bg = new Hr(),
  rs = '\u0275',
  Eg = ({ json: t, patch: e, patchText: r, context: n, keepOriginalStyles: i = !0 }) => {
    let s = _g(t, r)
    if (s.length === 0) throw new Error(`Could not find text ${r}`)
    for (let a of s) {
      let o = e.children.map((l) => Zn(Se(bg.format(l, n)))).map((l) => l.elements[0])
      switch (e.type) {
        case Of.DOCUMENT: {
          let l = xg(t, a.pathToParagraph),
            p = Tg(a.pathToParagraph)
          l.elements.splice(p, 1, ...o)
          break
        }
        case Of.PARAGRAPH:
        default: {
          let l = tp(t, a.pathToParagraph)
          mg({ paragraphElement: l, renderedParagraph: a, originalText: r, replacementText: rs })
          let p = wg(l, rs),
            g = l.elements[p],
            { left: v, right: E } = gg(g, rs),
            d = o,
            x = E
          if (i) {
            let b = g.elements.filter(
              (T) => T.type === 'element' && T.name !== 'w:t' && T.name !== 'w:br',
            )
            ;((d = o.map((T) => Ue(ye({}, T), { elements: [...b, ...T.elements] }))),
              (x = Ue(ye({}, E), { elements: [...b, ...E.elements] })))
          }
          l.elements.splice(p, 1, v, ...d, x)
          break
        }
      }
    }
    return t
  },
  tp = (t, e) => {
    let r = t
    for (let n = 1; n < e.length; n++) {
      let i = e[n]
      r = r.elements[i]
    }
    return r
  },
  xg = (t, e) => tp(t, e.slice(0, e.length - 1)),
  Tg = (t) => t[t.length - 1],
  Ag = (t) => {
    let e = parseInt(t.substring(3), 10)
    return isNaN(e) ? 0 : e
  },
  Sg = (t) =>
    Zc(t, 'Relationships')
      .map((r) => {
        var n, i, s
        return Ag(
          (s = (i = (n = r.attributes) == null ? void 0 : n.Id) == null ? void 0 : i.toString()) !=
            null
            ? s
            : '',
        )
      })
      .reduce((r, n) => Math.max(r, n), 0) + 1,
  Cf = (t, e, r, n, i) => {
    let s = Zc(t, 'Relationships')
    return (
      s.push({
        attributes: { Id: `rId${e}`, Type: r, Target: n, TargetMode: i },
        name: 'Relationship',
        type: 'element',
      }),
      s
    )
  },
  Yt = (t, e, r) => {
    let n = Zc(t, 'Types')
    n.some((s) => {
      var a, o
      return (
        s.type === 'element' &&
        s.name === 'Default' &&
        ((a = s?.attributes) == null ? void 0 : a.ContentType) === e &&
        ((o = s?.attributes) == null ? void 0 : o.Extension) === r
      )
    }) || n.push({ attributes: { ContentType: e, Extension: r }, name: 'Default', type: 'element' })
  },
  Of = { DOCUMENT: 'file', PARAGRAPH: 'paragraph' },
  Df = new Wn(),
  Iy = (t) =>
    Zt(void 0, [t], function* ({ outputType: e, data: r, patches: n, keepOriginalStyles: i }) {
      var s, a
      let o = yield Un.loadAsync(r),
        l = new Map(),
        p = { Media: new In() },
        g = new Map(),
        v = [],
        E = [],
        d = !1,
        x = new Map()
      for (let [T, m] of Object.entries(o.files)) {
        if (!T.endsWith('.xml') && !T.endsWith('.rels')) {
          x.set(T, yield m.async('uint8array'))
          continue
        }
        let A = Zn(yield m.async('text'))
        if (T.startsWith('word/') && !T.endsWith('.xml.rels')) {
          let I = {
            file: p,
            viewWrapper: {
              Relationships: {
                createRelationship: (L, q, K, J) => {
                  E.push({ key: T, hyperlink: { id: L, link: K } })
                },
              },
            },
            stack: [],
          }
          l.set(T, I)
          for (let [L, q] of Object.entries(n)) {
            let K = `{{${L}}}`
            for (;;)
              try {
                Eg({
                  json: A,
                  patch: Ue(ye({}, q), {
                    children: q.children.map((J) => {
                      if (J instanceof wn) {
                        let R = new zt(J.options.children, Xc())
                        return (
                          E.push({ key: T, hyperlink: { id: R.linkId, link: J.options.link } }), R
                        )
                      } else return J
                    }),
                  }),
                  patchText: K,
                  context: I,
                  keepOriginalStyles: i,
                })
              } catch {
                break
              }
          }
          let D = Df.getMediaData(JSON.stringify(A), I.file.Media)
          D.length > 0 && ((d = !0), v.push({ key: T, mediaDatas: D }))
        }
        g.set(T, A)
      }
      for (let { key: T, mediaDatas: m } of v) {
        let A = `word/_rels/${T.split('/').pop()}.rels`,
          I = (s = g.get(A)) != null ? s : Ff()
        g.set(A, I)
        let D = Sg(I),
          L = Df.replace(JSON.stringify(g.get(T)), m, D)
        g.set(T, JSON.parse(L))
        for (let q = 0; q < m.length; q++) {
          let { fileName: K } = m[q]
          Cf(
            I,
            D + q,
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
            `media/${K}`,
          )
        }
      }
      for (let { key: T, hyperlink: m } of E) {
        let A = `word/_rels/${T.split('/').pop()}.rels`,
          I = (a = g.get(A)) != null ? a : Ff()
        ;(g.set(A, I),
          Cf(
            I,
            m.id,
            'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
            m.link,
            $d.EXTERNAL,
          ))
      }
      if (d) {
        let T = g.get('[Content_Types].xml')
        if (!T) throw new Error('Could not find content types file')
        ;(Yt(T, 'image/png', 'png'),
          Yt(T, 'image/jpeg', 'jpeg'),
          Yt(T, 'image/jpeg', 'jpg'),
          Yt(T, 'image/bmp', 'bmp'),
          Yt(T, 'image/gif', 'gif'),
          Yt(T, 'image/svg+xml', 'svg'))
      }
      let b = new Un()
      for (let [T, m] of g) {
        let A = Ig(m)
        b.file(T, A)
      }
      for (let [T, m] of x) b.file(T, m)
      for (let { data: T, fileName: m } of p.Media.Array) b.file(`word/media/${m}`, T)
      return b.generateAsync({
        type: e,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        compression: 'DEFLATE',
      })
    }),
  Ig = (t) => Kn.js2xml(t),
  Ff = () => ({
    declaration: { attributes: { version: '1.0', encoding: 'UTF-8', standalone: 'yes' } },
    elements: [
      {
        type: 'element',
        name: 'Relationships',
        attributes: { xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships' },
        elements: [],
      },
    ],
  }),
  Ry = (t) =>
    Zt(void 0, [t], function* ({ data: e }) {
      let r = yield Un.loadAsync(e),
        n = new Set()
      for (let [i, s] of Object.entries(r.files))
        if (
          !(!i.endsWith('.xml') && !i.endsWith('.rels')) &&
          i.startsWith('word/') &&
          !i.endsWith('.xml.rels')
        ) {
          let a = Zn(yield s.async('text'))
          ep(a).forEach((o) => Rg(o.text).forEach((l) => n.add(l)))
        }
      return Array.from(n)
    }),
  Rg = (t) => {
    var e
    let r = new RegExp('(?<=\\{\\{).+?(?=\\}\\})', 'gs')
    return (e = t.match(r)) != null ? e : []
  }
export {
  Nn as AbstractNumbering,
  sn as Alignment,
  fs as AlignmentAttributes,
  st as AlignmentType,
  Fh as AnnotationReference,
  Ae as Attributes,
  on as BaseEmphasisMark,
  rr as BaseXmlComponent,
  da as Body,
  Vo as Bookmark,
  Xo as BookmarkEnd,
  qo as BookmarkStart,
  ps as Border,
  xe as BorderElement,
  Vc as BorderStyle,
  Ie as BuilderElement,
  Hh as CarriageReturn,
  Sy as CharacterSet,
  Sf as CheckBox,
  Dr as CheckBoxSymbolElement,
  Nc as CheckBoxUtil,
  Yh as Column,
  Kh as ColumnBreak,
  ea as Columns,
  Co as Comment,
  Th as CommentRangeEnd,
  xh as CommentRangeStart,
  Ah as CommentReference,
  Oo as Comments,
  zt as ConcreteHyperlink,
  kn as ConcreteNumbering,
  Uh as ContinuationSeparator,
  Ch as DayLong,
  Rh as DayShort,
  Af as DeletedTextRun,
  ta as DocGridAttributes,
  yf as Document,
  jt as DocumentAttributes,
  ma as DocumentBackground,
  pa as DocumentBackgroundAttributes,
  vc as DocumentDefaults,
  ra as DocumentGrid,
  ty as DocumentGridType,
  fh as DotEmphasisMark,
  Ao as Drawing,
  cy as DropCapType,
  Hp as EMPTY_OBJECT,
  Es as EmphasisMark,
  _d as EmphasisMarkType,
  Ce as EmptyElement,
  Bh as EndnoteReference,
  wn as ExternalHyperlink,
  yf as File,
  Ur as FileChild,
  xc as FootNoteReferenceRunAttributes,
  ku as FootNotes,
  Ef as Footer,
  bu as FooterWrapper,
  Tc as FootnoteReference,
  Lh as FootnoteReferenceElement,
  xf as FootnoteReferenceRun,
  ly as FrameAnchorType,
  hy as FrameWrap,
  Ya as GridSpan,
  bf as Header,
  Cr as HeaderFooterReference,
  tr as HeaderFooterReferenceType,
  Xh as HeaderFooterType,
  Du as HeaderWrapper,
  Xg as HeadingLevel,
  by as HeightRule,
  jg as HighlightColor,
  Us as HorizontalPosition,
  Pg as HorizontalPositionAlign,
  L0 as HorizontalPositionRelativeFrom,
  Rr as HpsMeasureElement,
  Qg as HyperlinkType,
  et as IgnoreIfEmptyXmlComponent,
  _h as ImageRun,
  ls as ImportedRootElementAttributes,
  cs as ImportedXmlComponent,
  ws as Indent,
  nn as InitializableXmlComponent,
  Tf as InsertedTextRun,
  Vh as InternalHyperlink,
  zh as LastRenderedPageBreak,
  Zg as LeaderType,
  Hu as Level,
  Rn as LevelBase,
  gf as LevelForOverride,
  Et as LevelFormat,
  $u as LevelOverride,
  Ay as LevelSuffix,
  ry as LineNumberRestartFormat,
  Fo as LineRuleType,
  fy as Math,
  Ta as MathAccentCharacter,
  df as MathAngledBrackets,
  Be as MathBase,
  ff as MathCurlyBrackets,
  La as MathDegree,
  ba as MathDenominator,
  Jh as MathFraction,
  cf as MathFunction,
  Ma as MathFunctionName,
  Ha as MathFunctionProperties,
  ef as MathIntegral,
  bn as MathLimit,
  Sa as MathLimitLocation,
  rf as MathLimitLower,
  tf as MathLimitUpper,
  _n as MathNAryProperties,
  Ea as MathNumerator,
  af as MathPreSubSuperScript,
  Fa as MathPreSubSuperScriptProperties,
  uf as MathRadical,
  Ua as MathRadicalProperties,
  lf as MathRoundBrackets,
  Zh as MathRun,
  hf as MathSquareBrackets,
  sf as MathSubScript,
  Gt as MathSubScriptElement,
  Oa as MathSubScriptProperties,
  of as MathSubSuperScript,
  Da as MathSubSuperScriptProperties,
  Qh as MathSum,
  nf as MathSuperScript,
  Kt as MathSuperScriptElement,
  Ca as MathSuperScriptProperties,
  In as Media,
  Oh as MonthLong,
  Nh as MonthShort,
  Ge as NextAttributeComponent,
  Sh as NoBreakHyphen,
  Mg as NumberFormat,
  kr as NumberProperties,
  Fr as NumberValueElement,
  Xu as Numbering,
  ae as OnOffElement,
  Yo as OutlineLevel,
  vy as OverlapType,
  Dc as Packer,
  ny as PageBorderDisplay,
  iy as PageBorderOffsetFrom,
  sy as PageBorderZOrder,
  na as PageBorders,
  Gh as PageBreak,
  Do as PageBreakBefore,
  ia as PageMargin,
  Ht as PageNumber,
  Mh as PageNumberElement,
  oy as PageNumberSeparator,
  oa as PageNumberType,
  sa as PageNumberTypeAttributes,
  Vd as PageOrientation,
  qh as PageReference,
  aa as PageSize,
  ca as PageTextDirection,
  ay as PageTextDirectionType,
  Nt as Paragraph,
  Ft as ParagraphProperties,
  gc as ParagraphPropertiesDefaults,
  Of as PatchType,
  jh as PositionalTab,
  $g as PositionalTabAlignment,
  qg as PositionalTabLeader,
  Vg as PositionalTabRelativeTo,
  dg as PrettifyType,
  gy as RelativeHorizontalPosition,
  yy as RelativeVerticalPosition,
  He as Run,
  Nr as RunFonts,
  pt as RunProperties,
  ks as RunPropertiesChange,
  yc as RunPropertiesDefaults,
  fa as SectionProperties,
  uy as SectionType,
  la as SectionTypeAttributes,
  Ph as Separator,
  bh as SequentialIdentifier,
  sr as Shading,
  Hg as ShadingType,
  Ro as SimpleField,
  Eh as SimpleMailMergeField,
  Bs as SimplePos,
  Ih as SoftHyphen,
  Ke as SpaceType,
  Bo as Spacing,
  xt as StringContainer,
  hs as StringEnumValueElement,
  lt as StringValueElement,
  Jr as Style,
  dr as StyleForCharacter,
  fr as StyleForParagraph,
  _f as StyleLevel,
  Mr as Styles,
  Os as SymbolRun,
  Qa as TDirection,
  Wh as Tab,
  Uo as TabAttributes,
  Po as TabStop,
  Mo as TabStopItem,
  Jg as TabStopPosition,
  $h as TabStopType,
  pf as Table,
  wy as TableAnchorType,
  An as TableBorders,
  Tn as TableCell,
  qa as TableCellBorders,
  tu as TableFloatProperties,
  nu as TableLayout,
  _y as TableLayoutType,
  vf as TableOfContents,
  iu as TableProperties,
  mf as TableRow,
  ou as TableRowHeight,
  su as TableRowHeightAttributes,
  au as TableRowProperties,
  St as TableWidthElement,
  my as TextDirection,
  zg as TextEffect,
  ar as TextRun,
  G0 as TextWrappingSide,
  Zr as TextWrappingType,
  ms as ThematicBreak,
  ha as Type,
  Ns as Underline,
  Ed as UnderlineType,
  ey as VerticalAlign,
  Jo as VerticalAlignAttributes,
  gn as VerticalAlignElement,
  xn as VerticalMerge,
  Xd as VerticalMergeType,
  Hs as VerticalPosition,
  Ug as VerticalPositionAlign,
  B0 as VerticalPositionRelativeFrom,
  Ty as WORKAROUND2,
  Dg as WORKAROUND3,
  py as WORKAROUND4,
  Va as WidthType,
  hn as WrapNone,
  mo as WrapSquare,
  go as WrapTight,
  vo as WrapTopAndBottom,
  ce as XmlAttributeComponent,
  M as XmlComponent,
  Dh as YearLong,
  kh as YearShort,
  k0 as abstractNumUniqueNumericIdGen,
  D0 as bookmarkUniqueNumericIdGen,
  C0 as concreteNumUniqueNumericIdGen,
  Ze as convertInchesToTwip,
  Kg as convertMillimetersToTwip,
  $c as convertToXmlComponent,
  X0 as createFrameProperties,
  q0 as createLineNumberType,
  Er as createStringElement,
  Jm as dateTimeValue,
  De as decimalNumber,
  O0 as docPropertiesUniqueNumericIdGen,
  Ym as eighthPointMeasureValue,
  yh as hashedId,
  ir as hexColorValue,
  Vm as hpsMeasureValue,
  Fg as longHexNumber,
  Xm as measurementOrPercentValue,
  Ry as patchDetector,
  Iy as patchDocument,
  qm as percentageValue,
  Zm as pointMeasureValue,
  yd as positiveUniversalMeasureValue,
  Ut as sectionMarginDefaults,
  es as sectionPageSizeDefaults,
  $m as shortHexNumber,
  Lg as signedHpsMeasureValue,
  At as signedTwipsMeasureValue,
  ke as twipsMeasureValue,
  hh as uCharHexNumber,
  Xc as uniqueId,
  Yn as uniqueNumericIdCreator,
  F0 as uniqueUuid,
  qn as universalMeasureValue,
  $n as unsignedDecimalNumber,
}
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

docx/build/index.mjs:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)
  (*! http://mths.be/fromcodepoint v0.1.0 by @mathias *)
*/
