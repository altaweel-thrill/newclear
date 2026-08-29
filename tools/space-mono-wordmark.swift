import CoreGraphics
import CoreText
import Foundation

let fontPath = CommandLine.arguments.count > 1
  ? CommandLine.arguments[1]
  : "assets/fonts/space-mono/SpaceMono-Bold.ttf"
let word = "NEWCLEAR"
let fontSize: CGFloat = 272
let centerX: CGFloat = 704
let baselineY: CGFloat = 255
let stretchCenterY: CGFloat = 147
let stretchY: CGFloat = 1.18
let letterSpacing: CGFloat = 0

guard
  let provider = CGDataProvider(url: URL(fileURLWithPath: fontPath) as CFURL),
  let graphicsFont = CGFont(provider)
else {
  fatalError("Unable to load font at \(fontPath)")
}

let font = CTFontCreateWithGraphicsFont(graphicsFont, fontSize, nil, nil)
let characters = Array(word.utf16)
var glyphs = [CGGlyph](repeating: 0, count: characters.count)

let mapped = characters.withUnsafeBufferPointer { characterBuffer in
  glyphs.withUnsafeMutableBufferPointer { glyphBuffer in
    CTFontGetGlyphsForCharacters(
      font,
      characterBuffer.baseAddress!,
      glyphBuffer.baseAddress!,
      characters.count
    )
  }
}

guard mapped else {
  fatalError("Unable to map every character to a glyph")
}

var advances = [CGSize](repeating: .zero, count: glyphs.count)
glyphs.withUnsafeBufferPointer { glyphBuffer in
  advances.withUnsafeMutableBufferPointer { advanceBuffer in
    _ = CTFontGetAdvancesForGlyphs(
      font,
      .horizontal,
      glyphBuffer.baseAddress!,
      advanceBuffer.baseAddress!,
      glyphs.count
    )
  }
}

let totalWidth = advances.reduce(0) { $0 + $1.width }
  + letterSpacing * CGFloat(max(0, glyphs.count - 1))
var penX = centerX - totalWidth / 2
var commands: [String] = []

func number(_ value: CGFloat) -> String {
  let rounded = (value * 100).rounded() / 100
  if rounded == rounded.rounded() { return String(Int(rounded)) }
  return String(format: "%.2f", Double(rounded))
}

func point(_ source: CGPoint, offsetX: CGFloat) -> CGPoint {
  let svgY = baselineY - source.y
  return CGPoint(
    x: offsetX + source.x,
    y: stretchCenterY + (svgY - stretchCenterY) * stretchY
  )
}

for index in glyphs.indices {
  if let path = CTFontCreatePathForGlyph(font, glyphs[index], nil) {
    path.applyWithBlock { pointer in
      let element = pointer.pointee
      switch element.type {
      case .moveToPoint:
        let p = point(element.points[0], offsetX: penX)
        commands.append("M\(number(p.x)) \(number(p.y))")
      case .addLineToPoint:
        let p = point(element.points[0], offsetX: penX)
        commands.append("L\(number(p.x)) \(number(p.y))")
      case .addQuadCurveToPoint:
        let c = point(element.points[0], offsetX: penX)
        let p = point(element.points[1], offsetX: penX)
        commands.append("Q\(number(c.x)) \(number(c.y)) \(number(p.x)) \(number(p.y))")
      case .addCurveToPoint:
        let c1 = point(element.points[0], offsetX: penX)
        let c2 = point(element.points[1], offsetX: penX)
        let p = point(element.points[2], offsetX: penX)
        commands.append(
          "C\(number(c1.x)) \(number(c1.y)) \(number(c2.x)) \(number(c2.y)) \(number(p.x)) \(number(p.y))"
        )
      case .closeSubpath:
        commands.append("Z")
      @unknown default:
        break
      }
    }
  }
  penX += advances[index].width + letterSpacing
}

print(commands.joined(separator: " "))
