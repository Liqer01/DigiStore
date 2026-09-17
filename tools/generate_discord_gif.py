import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_discord_gif():
    OUTPUT_DIR = r"C:\Users\zeybe\.gemini\antigravity\scratch\digital-store"
    ARTIFACTS_DIR = r"C:\Users\zeybe\.gemini\antigravity\brain\fd1fb7f0-0c0d-4861-b985-a148530e1c04"
    
    W, H = 512, 512
    SCALE = 2  # 1024x1024 supersampling
    SW, SH = W * SCALE, H * SCALE
    NUM_FRAMES = 36
    DURATION = 42  # ~24 fps -> 1.51s seamless loop
    
    font_bold_path = r"C:\Windows\Fonts\segoeuib.ttf"
    font_main = ImageFont.truetype(font_bold_path, 28 * SCALE)
    font_sub = ImageFont.truetype(font_bold_path, 11 * SCALE)
    
    # Normalized lightning bolt coordinates in 24x24 viewBox
    raw_pts = [(13, 2), (3.5, 13.5), (11.5, 13.5), (10, 22), (20.5, 10.5), (12.5, 10.5)]
    norm_pts = [((x - 12.0), (y - 12.0)) for x, y in raw_pts]
    
    frames_v1 = []  # Master version with branding
    frames_v2 = []  # Pure emblem centered variant
    
    for frame_idx in range(NUM_FRAMES):
        t = frame_idx / NUM_FRAMES
        angle_rad = t * 2 * math.pi
        pulse = math.sin(angle_rad)
        
        # ----------------------------------------------------
        # RENDER FRAME FOR VARIANT 1 (Master With Capsule)
        # ----------------------------------------------------
        img1 = Image.new("RGBA", (SW, SH), (7, 8, 13, 255))
        
        # 1. Ambient Background Glows
        glow_layer = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        g_draw = ImageDraw.Draw(glow_layer)
        
        gx1 = int(SW // 2 + math.cos(angle_rad) * 40 * SCALE)
        gy1 = int(SH * 0.40 + math.sin(angle_rad) * 30 * SCALE)
        g_draw.ellipse([gx1 - 200 * SCALE, gy1 - 200 * SCALE, gx1 + 200 * SCALE, gy1 + 200 * SCALE], fill=(168, 85, 247, 50))
        
        gx2 = int(SW // 2 - math.cos(angle_rad) * 40 * SCALE)
        gy2 = int(SH * 0.40 - math.sin(angle_rad) * 30 * SCALE)
        g_draw.ellipse([gx2 - 180 * SCALE, gy2 - 180 * SCALE, gx2 + 180 * SCALE, gy2 + 180 * SCALE], fill=(59, 130, 246, 45))
        
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=50 * SCALE))
        img1 = Image.alpha_composite(img1, glow_layer)
        
        d1 = ImageDraw.Draw(img1)
        
        # 2. Outer Rotating Cyber Ring (Inside Discord 512 crop circle)
        ring_r = int(236 * SCALE)
        cx, cy_ring = SW // 2, SH // 2
        
        # Base subtle circular track
        d1.ellipse([cx - ring_r, cy_ring - ring_r, cx + ring_r, cy_ring + ring_r], outline=(255, 255, 255, 25), width=int(2 * SCALE))
        
        # Orbiting Arc 1 (Purple)
        arc1_start = int(t * 360)
        d1.arc([cx - ring_r, cy_ring - ring_r, cx + ring_r, cy_ring + ring_r], start=arc1_start, end=arc1_start + 75, fill=(192, 132, 252, 240), width=int(4 * SCALE))
        
        # Orbiting Arc 2 (Electric Cyan)
        arc2_start = int((t * 360 + 180) % 360)
        d1.arc([cx - ring_r, cy_ring - ring_r, cx + ring_r, cy_ring + ring_r], start=arc2_start, end=arc2_start + 75, fill=(56, 189, 248, 240), width=int(4 * SCALE))
        
        # Orbiting glowing beads at arc heads
        for arc_angle, col in [(arc1_start + 75, (230, 180, 255, 255)), (arc2_start + 75, (180, 240, 255, 255))]:
            rad = math.radians(arc_angle)
            bx = int(cx + ring_r * math.cos(rad))
            by = int(cy_ring + ring_r * math.sin(rad))
            d1.ellipse([bx - 5 * SCALE, by - 5 * SCALE, bx + 5 * SCALE, by + 5 * SCALE], fill=col)
        
        # 3. Emblem Pedestal (Obsidian Cyber Squircle)
        ped_cx, ped_cy = SW // 2, int(SH * 0.38)
        pw, ph = int(185 * SCALE), int(185 * SCALE)
        pradius = int(50 * SCALE)
        
        # Pedestal Fill & Border
        d1.rounded_rectangle([ped_cx - pw // 2, ped_cy - ph // 2, ped_cx + pw // 2, ped_cy + ph // 2], radius=pradius, fill=(14, 15, 23, 245), outline=(255, 255, 255, 38), width=int(2 * SCALE))
        
        # Inner Neon Pedestal Rim (pulsing)
        rim_alpha = int(140 + 60 * pulse)
        d1.rounded_rectangle([ped_cx - pw // 2 + 3 * SCALE, ped_cy - ph // 2 + 3 * SCALE, ped_cx + pw // 2 - 3 * SCALE, ped_cy + ph // 2 - 3 * SCALE], radius=pradius - 3 * SCALE, outline=(168, 85, 247, rim_alpha), width=int(1.5 * SCALE))
        
        # Top Specular Highlight
        d1.line([ped_cx - int(pw * 0.3), ped_cy - ph // 2 + int(3 * SCALE), ped_cx + int(pw * 0.3), ped_cy - ph // 2 + int(3 * SCALE)], fill=(255, 255, 255, 130), width=int(2 * SCALE))
        
        # 4. Central Razor Lightning Bolt
        bolt_scale = (13.5 + 0.35 * pulse) * SCALE
        bolt_pts = [(int(ped_cx + x * bolt_scale), int(ped_cy + y * bolt_scale)) for x, y in norm_pts]
        
        # Multi-layer Lightning Bloom
        bloom_layer = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        b_draw = ImageDraw.Draw(bloom_layer)
        b_draw.polygon(bolt_pts, fill=(168, 85, 247, 230))
        bloom_layer = bloom_layer.filter(ImageFilter.GaussianBlur(radius=16 * SCALE))
        img1 = Image.alpha_composite(img1, bloom_layer)
        
        bloom_layer2 = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        b_draw2 = ImageDraw.Draw(bloom_layer2)
        b_draw2.polygon(bolt_pts, fill=(96, 165, 250, 240))
        bloom_layer2 = bloom_layer2.filter(ImageFilter.GaussianBlur(radius=7 * SCALE))
        img1 = Image.alpha_composite(img1, bloom_layer2)
        
        d1 = ImageDraw.Draw(img1)
        # Main Pure White Core
        d1.polygon(bolt_pts, fill=(255, 255, 255, 255))
        
        # Specular Shimmer Line Gliding across bolt
        shimmer_pos = int((t * 2.0 - 0.5) * (pw * 1.6))
        shim_layer = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shim_layer)
        s_draw.polygon(bolt_pts, fill=(255, 255, 255, 255))
        
        # Mask with diagonal slit
        mask = Image.new("L", (SW, SH), 0)
        m_draw = ImageDraw.Draw(mask)
        line_x = ped_cx - pw // 2 + shimmer_pos
        m_draw.polygon([
            (line_x - int(15 * SCALE), ped_cy - ph // 2),
            (line_x + int(15 * SCALE), ped_cy - ph // 2),
            (line_x - int(70 * SCALE), ped_cy + ph // 2),
            (line_x - int(100 * SCALE), ped_cy + ph // 2)
        ], fill=160)
        
        shim_applied = Image.new("RGBA", (SW, SH), (220, 240, 255, 255))
        img1.paste(shim_applied, (0, 0), mask=Image.composite(mask, s_draw._image.split()[3], mask))
        
        d1 = ImageDraw.Draw(img1)
        
        # 5. closydev. Brand Capsule (Bottom safe zone)
        cap_cx, cap_cy = SW // 2, int(SH * 0.75)
        cw, ch = int(195 * SCALE), int(44 * SCALE)
        cradius = int(22 * SCALE)
        
        d1.rounded_rectangle([cap_cx - cw // 2, cap_cy - ch // 2, cap_cx + cw // 2, cap_cy + ch // 2], radius=cradius, fill=(15, 16, 24, 230), outline=(255, 255, 255, 30), width=int(1.5 * SCALE))
        d1.line([cap_cx - int(cw * 0.35), cap_cy - ch // 2 + int(2 * SCALE), cap_cx + int(cw * 0.35), cap_cy - ch // 2 + int(2 * SCALE)], fill=(255, 255, 255, 80), width=int(1.5 * SCALE))
        
        # Typography: closydev + dot
        brand_text = "closydev"
        dot_text = "."
        
        bbox_brand = font_main.getbbox(brand_text)
        bbox_dot = font_main.getbbox(dot_text)
        total_tw = (bbox_brand[2] - bbox_brand[0]) + (bbox_dot[2] - bbox_dot[0])
        
        tx = cap_cx - total_tw // 2
        ty = cap_cy - (bbox_brand[3] - bbox_brand[1]) // 2 - int(2 * SCALE)
        
        d1.text((tx, ty), brand_text, font=font_main, fill=(255, 255, 255, 255))
        dot_x = tx + (bbox_brand[2] - bbox_brand[0])
        # Glowing dot pulse
        dot_alpha = int(200 + 55 * pulse)
        d1.text((dot_x, ty), dot_text, font=font_main, fill=(192, 132, 252, dot_alpha))
        
        # Subtitle: DIGITAL DEVELOPMENT
        sub_text = "DIGITAL DEVELOPMENT"
        bbox_sub = font_sub.getbbox(sub_text)
        sub_tw = bbox_sub[2] - bbox_sub[0]
        d1.text((SW // 2 - sub_tw // 2, int(SH * 0.84)), sub_text, font=font_sub, fill=(148, 163, 184, int(180 + 40 * pulse)))
        
        # Downsample to 512x512 with LANCZOS
        final_frame1 = img1.resize((W, H), Image.Resampling.LANCZOS)
        q_frame1 = final_frame1.convert("RGB").quantize(colors=256)
        frames_v1.append(q_frame1)
        
        # ----------------------------------------------------
        # RENDER FRAME FOR VARIANT 2 (Max Emblem Centered)
        # ----------------------------------------------------
        img2 = Image.new("RGBA", (SW, SH), (7, 8, 13, 255))
        glow_layer2 = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        g_draw2 = ImageDraw.Draw(glow_layer2)
        g_draw2.ellipse([SW // 2 - 240 * SCALE, SH // 2 - 240 * SCALE, SW // 2 + 240 * SCALE, SH // 2 + 240 * SCALE], fill=(168, 85, 247, int(50 + 20 * pulse)))
        g_draw2.ellipse([SW // 2 - 180 * SCALE, SH // 2 - 180 * SCALE, SW // 2 + 180 * SCALE, SH // 2 + 180 * SCALE], fill=(59, 130, 246, int(50 - 20 * pulse)))
        glow_layer2 = glow_layer2.filter(ImageFilter.GaussianBlur(radius=50 * SCALE))
        img2 = Image.alpha_composite(img2, glow_layer2)
        
        d2 = ImageDraw.Draw(img2)
        
        # Circular HUD Rings
        d2.ellipse([cx - ring_r, cy_ring - ring_r, cx + ring_r, cy_ring + ring_r], outline=(255, 255, 255, 25), width=int(2 * SCALE))
        d2.arc([cx - ring_r, cy_ring - ring_r, cx + ring_r, cy_ring + ring_r], start=arc1_start, end=arc1_start + 85, fill=(192, 132, 252, 240), width=int(4.5 * SCALE))
        d2.arc([cx - ring_r, cy_ring - ring_r, cx + ring_r, cy_ring + ring_r], start=arc2_start, end=arc2_start + 85, fill=(56, 189, 248, 240), width=int(4.5 * SCALE))
        
        for arc_angle, col in [(arc1_start + 85, (230, 180, 255, 255)), (arc2_start + 85, (180, 240, 255, 255))]:
            rad = math.radians(arc_angle)
            bx = int(cx + ring_r * math.cos(rad))
            by = int(cy_ring + ring_r * math.sin(rad))
            d2.ellipse([bx - 6 * SCALE, by - 6 * SCALE, bx + 6 * SCALE, by + 6 * SCALE], fill=col)
            
        # Inner Rotating Hexagon / HUD Ring
        inner_r = int(185 * SCALE)
        d2.arc([cx - inner_r, cy_ring - inner_r, cx + inner_r, cy_ring + inner_r], start=int(360 - t * 360), end=int(360 - t * 360 + 60), fill=(255, 255, 255, 90), width=int(2 * SCALE))
        d2.arc([cx - inner_r, cy_ring - inner_r, cx + inner_r, cy_ring + inner_r], start=int(360 - t * 360 + 180), end=int(360 - t * 360 + 240), fill=(255, 255, 255, 90), width=int(2 * SCALE))
        
        # Center Pedestal
        pw2, ph2 = int(240 * SCALE), int(240 * SCALE)
        d2.rounded_rectangle([cx - pw2 // 2, cy_ring - ph2 // 2, cx + pw2 // 2, cy_ring + ph2 // 2], radius=int(60 * SCALE), fill=(14, 15, 23, 245), outline=(255, 255, 255, 38), width=int(2 * SCALE))
        d2.rounded_rectangle([cx - pw2 // 2 + 3 * SCALE, cy_ring - ph2 // 2 + 3 * SCALE, cx + pw2 // 2 - 3 * SCALE, cy_ring + ph2 // 2 - 3 * SCALE], radius=int(57 * SCALE), outline=(168, 85, 247, rim_alpha), width=int(2 * SCALE))
        d2.line([cx - int(pw2 * 0.3), cy_ring - ph2 // 2 + int(3 * SCALE), cx + int(pw2 * 0.3), cy_ring - ph2 // 2 + int(3 * SCALE)], fill=(255, 255, 255, 120), width=int(2 * SCALE))
        
        # Larger Centered Lightning Bolt
        bolt_scale2 = (18.0 + 0.4 * pulse) * SCALE
        bolt_pts2 = [(int(cx + x * bolt_scale2), int(cy_ring + y * bolt_scale2)) for x, y in norm_pts]
        
        # Multi-layer Lightning Bloom
        b_layer1 = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        ImageDraw.Draw(b_layer1).polygon(bolt_pts2, fill=(168, 85, 247, 240))
        b_layer1 = b_layer1.filter(ImageFilter.GaussianBlur(radius=20 * SCALE))
        img2 = Image.alpha_composite(img2, b_layer1)
        
        b_layer2 = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        ImageDraw.Draw(b_layer2).polygon(bolt_pts2, fill=(96, 165, 250, 245))
        b_layer2 = b_layer2.filter(ImageFilter.GaussianBlur(radius=8 * SCALE))
        img2 = Image.alpha_composite(img2, b_layer2)
        
        d2 = ImageDraw.Draw(img2)
        d2.polygon(bolt_pts2, fill=(255, 255, 255, 255))
        
        # Shimmer line on Variant 2
        shimmer_pos2 = int((t * 2.0 - 0.5) * (pw2 * 1.6))
        s_layer2 = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        ImageDraw.Draw(s_layer2).polygon(bolt_pts2, fill=(255, 255, 255, 255))
        mask2 = Image.new("L", (SW, SH), 0)
        m_draw2 = ImageDraw.Draw(mask2)
        l_x = cx - pw2 // 2 + shimmer_pos2
        m_draw2.polygon([
            (l_x - int(18 * SCALE), cy_ring - ph2 // 2),
            (l_x + int(18 * SCALE), cy_ring - ph2 // 2),
            (l_x - int(80 * SCALE), cy_ring + ph2 // 2),
            (l_x - int(116 * SCALE), cy_ring + ph2 // 2)
        ], fill=170)
        img2.paste(Image.new("RGBA", (SW, SH), (230, 245, 255, 255)), (0, 0), mask=Image.composite(mask2, s_layer2.split()[3], mask2))
        
        # Mini brand tag at bottom of pedestal
        d2 = ImageDraw.Draw(img2)
        m_text = "closydev."
        bbox_m = font_sub.getbbox(m_text)
        m_tw = bbox_m[2] - bbox_m[0]
        d2.text((cx - m_tw // 2, int(SH * 0.88)), m_text, font=font_sub, fill=(255, 255, 255, 200))
        
        final_frame2 = img2.resize((W, H), Image.Resampling.LANCZOS)
        q_frame2 = final_frame2.convert("RGB").quantize(colors=256)
        frames_v2.append(q_frame2)

    # Save Variant 1 (Master Badge)
    v1_path = os.path.join(OUTPUT_DIR, "closydev-discord-icon.gif")
    v1_artifact = os.path.join(ARTIFACTS_DIR, "closydev-discord-icon.gif")
    frames_v1[0].save(v1_path, save_all=True, append_images=frames_v1[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    frames_v1[0].save(v1_artifact, save_all=True, append_images=frames_v1[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    
    # Save Variant 2 (Centered Max Emblem)
    v2_path = os.path.join(OUTPUT_DIR, "closydev-discord-icon-emblem.gif")
    v2_artifact = os.path.join(ARTIFACTS_DIR, "closydev-discord-icon-emblem.gif")
    frames_v2[0].save(v2_path, save_all=True, append_images=frames_v2[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    frames_v2[0].save(v2_artifact, save_all=True, append_images=frames_v2[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    
    # Save a static preview PNG
    frames_v1[0].save(os.path.join(OUTPUT_DIR, "closydev-discord-icon-preview.png"))
    frames_v1[0].save(os.path.join(ARTIFACTS_DIR, "closydev-discord-icon-preview.png"))
    
    print(f"Variant 1 generated: {v1_path} ({os.path.getsize(v1_path) / 1024:.1f} KB)")
    print(f"Variant 2 generated: {v2_path} ({os.path.getsize(v2_path) / 1024:.1f} KB)")

if __name__ == "__main__":
    create_discord_gif()
