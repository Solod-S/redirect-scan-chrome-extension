import zlib
import struct
import os

def make_png(size, out_path):
    width, height = size, size
    scale = size / 32.0

    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type: 0 (None)
        py = y / scale
        for x in range(width):
            px = x / scale
            corner_r = 7.0
            in_box = False
            if 2.0 <= px <= 30.0 and 2.0 <= py <= 30.0:
                left = 2.0 + corner_r
                right = 30.0 - corner_r
                top = 2.0 + corner_r
                bottom = 30.0 - corner_r
                if left <= px <= right or top <= py <= bottom:
                    in_box = True
                else:
                    cx = left if px < left else right
                    cy = top if py < top else bottom
                    if (px - cx)**2 + (py - cy)**2 <= corner_r**2:
                        in_box = True

            if in_box:
                t = (px + py) / 60.0
                r = int(37 * (1.0 - t) + 2 * t)
                g = int(99 * (1.0 - t) + 132 * t)
                b = int(235 * (1.0 - t) + 199 * t)

                # Arrow path
                in_vert = abs(px - 9.0) <= 1.4 and 15.5 <= py <= 22.5
                arc_dist = ((px - 16.0)**2 + (py - 16.0)**2)**0.5
                in_arc = abs(arc_dist - 7.0) <= 1.4 and px <= 16.5 and py <= 16.5
                in_horiz = abs(py - 9.0) <= 1.4 and 15.5 <= px <= 23.5

                def dist_seg(px, py, x1, y1, x2, y2):
                    dx, dy = x2 - x1, y2 - y1
                    l2 = dx*dx + dy*dy
                    if l2 == 0: return ((px - x1)**2 + (py - y1)**2)**0.5
                    u = max(0.0, min(1.0, ((px - x1)*dx + (py - y1)*dy) / l2))
                    return ((px - (x1 + u*dx))**2 + (py - (y1 + u*dy))**2)**0.5

                in_head = dist_seg(px, py, 20.0, 5.5, 24.0, 9.0) <= 1.4 or dist_seg(px, py, 20.0, 12.5, 24.0, 9.0) <= 1.4

                dot_dist = ((px - 23.0)**2 + (py - 23.0)**2)**0.5
                in_dot = dot_dist <= 2.2
                in_ring1 = abs(dot_dist - 5.0) <= 0.8 and px >= 16.0 and py >= 16.0
                in_ring2 = abs(dot_dist - 9.0) <= 0.8 and px >= 14.0 and py >= 14.0

                if in_vert or in_arc or in_horiz or in_head:
                    raw_data.extend([255, 255, 255, 255])
                elif in_dot:
                    raw_data.extend([56, 189, 248, 255])
                elif in_ring1 or in_ring2:
                    raw_data.extend([min(255, r + 70), min(255, g + 70), min(255, b + 50), 255])
                else:
                    raw_data.extend([r, g, b, 255])
            else:
                raw_data.extend([0, 0, 0, 0])

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    png += chunk(b'IEND', b'')

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'wb') as f:
        f.write(png)

if __name__ == '__main__':
    for size in [16, 32, 48, 128]:
        out = f'public/icons/icon-{size}.png'
        make_png(size, out)
        print(f'Generated: {out} ({size}x{size})')
