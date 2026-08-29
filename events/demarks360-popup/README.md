# Demarks360 pop-up kit

Brand overlay built from the company logo — greens `#076A3C` / `#044A2A`,
gold `#C69A4E`, cream `#F7F3EA`. The balloon ornament is lifted out of the
logo itself, so nothing here is AI-generated art.

| File | What it is |
|---|---|
| `DEMARKS360-FRAME-1200x1800.png` | Booth frame, 4x6 **portrait** @300dpi. Photo window 1132 x 1366 at (34, 34). |
| `DEMARKS360-FRAME-1800x1200.png` | Booth frame, 4x6 **landscape** @300dpi. Window 1740 x 908 at (30, 30). |
| `DEMARKS360-FRAME-1080x1920.png` | Booth frame, **digital / TouchPix** share size. Window 1020 x 1492 at (30, 30). |
| `DEMARKS360-SAMPLE-1200x1800.jpg` | Demo shot — what a guest walks away with. |
| `DEMARKS360-POPUP-SIGN-1800x2400.png` | Table sign. QR resolves to https://demarks360.ca (verified). Prints at 18 x 24 in. |

All three frames are real transparent PNGs: alpha is 0 inside the photo
window and 255 everywhere else, including the gold hairlines. Ornament was
drawn on its own layer before compositing — drawing a semi-transparent rule
straight onto the plate replaces alpha and punches a see-through slot that
lets the guest's photo bleed through the gold.

Rebuild: `frame.py` (frames), `sample.py` (demo shot), `board.py` (sign).
