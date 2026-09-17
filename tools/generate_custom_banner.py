import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def generate_discord_banner_and_icon():
    OUTPUT_DIR = r"C:\Users\zeybe\.gemini\antigravity\scratch\digital-store"
    ARTIFACTS_DIR = r"C:\Users\zeybe\.gemini\antigravity\brain\fd1fb7f0-0c0d-4861-b985-a148530e1c04"
    
    font_bold_path = r"C:\Windows\Fonts\segoeuib.ttf"
    
    # ----------------------------------------------------
    # 1. GENERATE 16:9 DISCORD BANNER (960x540)
    # ----------------------------------------------------
    W, H = 960, 540
    SCALE = 2  # 1920x1080 supersampling -> down to 960x540
    SW, SH = W * SCALE, H * SCALE
    NUM_FRAMES = 56
    DURATION = 42  # ~24 fps -> 2.35s seamless loop
    
    font_logo = ImageFont.truetype(font_bold_path, int(74 * SCALE))
    font_url = ImageFont.truetype(font_bold_path, int(26 * SCALE))
    
    # Official Razor Lightning Bolt coordinates from website SVG
    # viewBox="0 0 24 24": M13 2L3.5 13.5H11.5L10 22L20.5 10.5H12.5L13 2Z
    raw_bolt = [(13, 2), (3.5, 13.5), (11.5, 13.5), (10, 22), (20.5, 10.5), (12.5, 10.5)]
    norm_bolt = [((x - 12.0), (y - 12.0)) for x, y in raw_bolt]
    
    url_target = "discord.gg/closydev"
    total_chars = len(url_target)
    
    frames_banner = []
    
    for f_idx in range(NUM_FRAMES):
        # Background: Dark cyber grid + soft ambient neon glow
        bg = Image.new("RGBA", (SW, SH), (7, 8, 12, 255))
        bg_draw = ImageDraw.Draw(bg)
        
        # Grid lines
        grid_step = 40 * SCALE
        for x in range(0, SW, grid_step):
            bg_draw.line([(x, 0), (x, SH)], fill=(255, 255, 255, 9), width=int(1 * SCALE))
        for y in range(0, SH, grid_step):
            bg_draw.line([(0, y), (SW, y)], fill=(255, 255, 255, 9), width=int(1 * SCALE))
            
        cx, cy = SW // 2, SH // 2
        
        # Soft ambient glow in center
        glow_layer = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
        g_draw = ImageDraw.Draw(glow_layer)
        g_draw.ellipse([cx - int(340 * SCALE), cy - int(180 * SCALE), cx + int(340 * SCALE), cy + int(180 * SCALE)], fill=(56, 189, 248, 40))
        g_draw.ellipse([cx - int(200 * SCALE), cy - int(120 * SCALE), cx + int(200 * SCALE), cy + int(120 * SCALE)], fill=(168, 85, 247, 35))
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=60 * SCALE))
        bg = Image.alpha_composite(bg, glow_layer)
        
        # Timeline logic
        if f_idx <= 20:
            # Scene 1: Logo active
            logo_alpha = 1.0
            logo_scale = 1.0 + 0.015 * math.sin(f_idx / 20.0 * math.pi)
            capsule_alpha = 0.0
            capsule_scale = 0.90
            typed_len = 0
            show_cursor = True
        elif 21 <= f_idx <= 26:
            # Transition 1: Logo out, Capsule in
            progress = (f_idx - 21) / 5.0
            logo_alpha = 1.0 - progress
            logo_scale = 1.0 - 0.08 * progress
            capsule_alpha = progress
            capsule_scale = 0.90 + 0.10 * progress
            typed_len = 0
            show_cursor = True
        elif 27 <= f_idx <= 48:
            # Scene 2: Capsule typing
            logo_alpha = 0.0
            logo_scale = 0.90
            capsule_alpha = 1.0
            capsule_scale = 1.0
            type_progress = min(1.0, (f_idx - 27) / 16.0)
            typed_len = int(math.ceil(type_progress * total_chars))
            show_cursor = ((f_idx // 3) % 2 == 0)
        else:
            # Transition 2: Capsule out, Logo in
            progress = (f_idx - 49) / 6.0
            capsule_alpha = 1.0 - progress
            capsule_scale = 1.0 - 0.08 * progress
            logo_alpha = progress
            logo_scale = 0.90 + 0.10 * progress
            typed_len = total_chars
            show_cursor = True
            
        # ----------------------------------------------------
        # RENDER SCENE 1: LIGHTNING BOLT + closydev. LOGO
        # ----------------------------------------------------
        if logo_alpha > 0.01:
            logo_layer = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
            
            # Bolt scale & positioning
            scale_b = 3.9 * SCALE * logo_scale
            # Center offset: Bolt width ~65px, Gap ~30px, Text ~310px -> Total ~405px
            bolt_cx = cx - int(175 * SCALE * logo_scale)
            bolt_cy = cy
            
            b_pts = [(int(bolt_cx + x * scale_b), int(bolt_cy + y * scale_b)) for x, y in norm_bolt]
            
            # Diffuse ambient glow behind lightning (matching media_1789683123036.png)
            bolt_glow = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
            bglow_draw = ImageDraw.Draw(bolt_glow)
            bglow_draw.polygon(b_pts, fill=(255, 255, 255, int(180 * logo_alpha)))
            bolt_glow = bolt_glow.filter(ImageFilter.GaussianBlur(radius=int(22 * SCALE)))
            logo_layer = Image.alpha_composite(logo_layer, bolt_glow)
            
            l_draw = ImageDraw.Draw(logo_layer)
            # Pure solid white lightning bolt
            alpha_int = int(255 * logo_alpha)
            l_draw.polygon(b_pts, fill=(255, 255, 255, alpha_int))
            
            # Text: closydev.
            text_x = bolt_cx + int(56 * SCALE * logo_scale)
            text_y = cy - int(48 * SCALE * logo_scale)
            l_draw.text((text_x, text_y), "closydev.", font=font_logo, fill=(255, 255, 255, alpha_int))
            
            # Specular light gleam passing across the logo in Scene 1
            if f_idx <= 20:
                shim_t = f_idx / 20.0
                shim_x = bolt_cx - int(40 * SCALE) + int(shim_t * int(460 * SCALE))
                l_draw.line([(shim_x, cy - int(55 * SCALE)), (shim_x + int(35 * SCALE), cy + int(55 * SCALE))], fill=(255, 255, 255, int(95 * logo_alpha)), width=int(4 * SCALE))
                
            bg = Image.alpha_composite(bg, logo_layer)
            
        # ----------------------------------------------------
        # RENDER SCENE 2: SEARCH CAPSULE (Typewriter)
        # ----------------------------------------------------
        if capsule_alpha > 0.01:
            cap_layer = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
            
            cw = int(500 * SCALE * capsule_scale)
            ch = int(60 * SCALE * capsule_scale)
            cradius = ch // 2
            
            c_left = cx - cw // 2
            c_top = cy - ch // 2
            c_right = cx + cw // 2
            c_bottom = cy + ch // 2
            
            # Glowing cyan/blue halo behind capsule
            cap_glow = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
            cg_draw = ImageDraw.Draw(cap_glow)
            glow_pad = int(14 * SCALE)
            cg_draw.rounded_rectangle([c_left - glow_pad, c_top - glow_pad, c_right + glow_pad, c_bottom + glow_pad], radius=cradius + glow_pad, fill=(56, 189, 248, int(105 * capsule_alpha)))
            cap_glow = cap_glow.filter(ImageFilter.GaussianBlur(radius=int(18 * SCALE)))
            cap_layer = Image.alpha_composite(cap_layer, cap_glow)
            
            c_draw = ImageDraw.Draw(cap_layer)
            
            # Capsule Body: Deep obsidian glass with glowing cyan border
            c_alpha = int(240 * capsule_alpha)
            b_alpha = int(180 * capsule_alpha)
            c_draw.rounded_rectangle([c_left, c_top, c_right, c_bottom], radius=cradius, fill=(13, 16, 26, c_alpha), outline=(125, 211, 252, b_alpha), width=int(2 * SCALE))
            
            # Magnifying Glass Icon
            icon_cx = c_left + int(38 * SCALE * capsule_scale)
            icon_cy = cy
            ir = int(11 * SCALE * capsule_scale)
            
            c_draw.ellipse([icon_cx - ir, icon_cy - ir, icon_cx + ir, icon_cy + ir], outline=(255, 255, 255, int(230 * capsule_alpha)), width=int(2.5 * SCALE))
            c_draw.line([(icon_cx + int(ir * 0.7), icon_cy + int(ir * 0.7)), (icon_cx + int(ir * 1.6), icon_cy + int(ir * 1.6))], fill=(255, 255, 255, int(230 * capsule_alpha)), width=int(2.5 * SCALE))
            
            # Typewriter Text
            display_text = url_target[:typed_len]
            t_start_x = icon_cx + int(26 * SCALE * capsule_scale)
            t_start_y = cy - int(18 * SCALE * capsule_scale)
            
            text_col = (147, 197, 253, int(245 * capsule_alpha))
            c_draw.text((t_start_x, t_start_y), display_text, font=font_url, fill=text_col)
            
            # Blinking cursor
            if show_cursor and (f_idx >= 27) and (capsule_alpha > 0.5):
                bbox_t = font_url.getbbox(display_text) if display_text else [0, 0, 0, 0]
                cur_x = t_start_x + (bbox_t[2] - bbox_t[0]) + int(4 * SCALE)
                c_draw.line([(cur_x, cy - int(13 * SCALE)), (cur_x, cy + int(13 * SCALE))], fill=(255, 255, 255, int(230 * capsule_alpha)), width=int(2 * SCALE))
                
            bg = Image.alpha_composite(bg, cap_layer)
            
        final_banner = bg.resize((W, H), Image.Resampling.LANCZOS)
        q_banner = final_banner.convert("RGB").quantize(colors=256)
        frames_banner.append(q_banner)
        
    # Save Banner
    banner_path = os.path.join(OUTPUT_DIR, "closydev-discord-banner.gif")
    banner_artifact = os.path.join(ARTIFACTS_DIR, "closydev-discord-banner.gif")
    frames_banner[0].save(banner_path, save_all=True, append_images=frames_banner[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    frames_banner[0].save(banner_artifact, save_all=True, append_images=frames_banner[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    print(f"Lightning Banner generated: {banner_path} ({os.path.getsize(banner_path) / 1024:.1f} KB)")
    
    # ----------------------------------------------------
    # 2. ALSO GENERATE 1:1 SQUARE DISCORD ICON (512x512)
    # ----------------------------------------------------
    W2, H2 = 512, 512
    SW2, SH2 = W2 * SCALE, H2 * SCALE
    font_logo_sq = ImageFont.truetype(font_bold_path, int(52 * SCALE))
    font_url_sq = ImageFont.truetype(font_bold_path, int(20 * SCALE))
    
    frames_icon = []
    
    for f_idx in range(NUM_FRAMES):
        bg2 = Image.new("RGBA", (SW2, SH2), (7, 8, 12, 255))
        bg2_draw = ImageDraw.Draw(bg2)
        
        # Grid
        grid_step = 36 * SCALE
        for x in range(0, SW2, grid_step):
            bg2_draw.line([(x, 0), (x, SH2)], fill=(255, 255, 255, 9), width=int(1 * SCALE))
        for y in range(0, SH2, grid_step):
            bg2_draw.line([(0, y), (SW2, y)], fill=(255, 255, 255, 9), width=int(1 * SCALE))
            
        cx2, cy2 = SW2 // 2, SH2 // 2
        
        # Ambient Glow
        glow_layer2 = Image.new("RGBA", (SW2, SH2), (0, 0, 0, 0))
        g_draw2 = ImageDraw.Draw(glow_layer2)
        g_draw2.ellipse([cx2 - int(200 * SCALE), cy2 - int(200 * SCALE), cx2 + int(200 * SCALE), cy2 + int(200 * SCALE)], fill=(56, 189, 248, 50))
        g_draw2.ellipse([cx2 - int(140 * SCALE), cy2 - int(140 * SCALE), cx2 + int(140 * SCALE), cy2 + int(140 * SCALE)], fill=(168, 85, 247, 45))
        glow_layer2 = glow_layer2.filter(ImageFilter.GaussianBlur(radius=40 * SCALE))
        bg2 = Image.alpha_composite(bg2, glow_layer2)
        
        if f_idx <= 20:
            l_alpha = 1.0
            l_sc = 1.0 + 0.015 * math.sin(f_idx / 20.0 * math.pi)
            c_alpha = 0.0
            c_sc = 0.90
            t_len = 0
            cur_on = True
        elif 21 <= f_idx <= 26:
            prog = (f_idx - 21) / 5.0
            l_alpha = 1.0 - prog
            l_sc = 1.0 - 0.08 * prog
            c_alpha = prog
            c_sc = 0.90 + 0.10 * prog
            t_len = 0
            cur_on = True
        elif 27 <= f_idx <= 48:
            l_alpha = 0.0
            l_sc = 0.90
            c_alpha = 1.0
            c_sc = 1.0
            t_prog = min(1.0, (f_idx - 27) / 16.0)
            t_len = int(math.ceil(t_prog * total_chars))
            cur_on = ((f_idx // 3) % 2 == 0)
        else:
            prog = (f_idx - 49) / 6.0
            c_alpha = 1.0 - prog
            c_sc = 1.0 - 0.08 * prog
            l_alpha = prog
            l_sc = 0.90 + 0.10 * prog
            t_len = total_chars
            cur_on = True
            
        # Scene 1 for Icon (Vertical Stacking of Lightning + Text)
        if l_alpha > 0.01:
            l_layer = Image.new("RGBA", (SW2, SH2), (0, 0, 0, 0))
            bolt_cy_sq = cy2 - int(45 * SCALE * l_sc)
            scale_b_sq = 4.6 * SCALE * l_sc
            
            b_pts_sq = [(int(cx2 + x * scale_b_sq), int(bolt_cy_sq + y * scale_b_sq)) for x, y in norm_bolt]
            
            # Glow behind lightning
            bglow_sq = Image.new("RGBA", (SW2, SH2), (0, 0, 0, 0))
            ImageDraw.Draw(bglow_sq).polygon(b_pts_sq, fill=(255, 255, 255, int(180 * l_alpha)))
            bglow_sq = bglow_sq.filter(ImageFilter.GaussianBlur(radius=int(22 * SCALE)))
            l_layer = Image.alpha_composite(l_layer, bglow_sq)
            
            ld = ImageDraw.Draw(l_layer)
            a_int = int(255 * l_alpha)
            ld.polygon(b_pts_sq, fill=(255, 255, 255, a_int))
            
            # Text below lightning
            bbox_t = font_logo_sq.getbbox("closydev.")
            w_text = bbox_t[2] - bbox_t[0]
            tx = cx2 - w_text // 2
            ty = cy2 + int(36 * SCALE * l_sc)
            ld.text((tx, ty), "closydev.", font=font_logo_sq, fill=(255, 255, 255, a_int))
            
            bg2 = Image.alpha_composite(bg2, l_layer)
            
        # Scene 2 for Icon (Compact Search Capsule)
        if c_alpha > 0.01:
            c_layer = Image.new("RGBA", (SW2, SH2), (0, 0, 0, 0))
            cw2 = int(390 * SCALE * c_sc)
            ch2 = int(54 * SCALE * c_sc)
            cr2 = ch2 // 2
            
            cl = cx2 - cw2 // 2
            ct = cy2 - ch2 // 2
            cr = cx2 + cw2 // 2
            cb = cy2 + ch2 // 2
            
            cg = Image.new("RGBA", (SW2, SH2), (0, 0, 0, 0))
            ImageDraw.Draw(cg).rounded_rectangle([cl - 10 * SCALE, ct - 10 * SCALE, cr + 10 * SCALE, cb + 10 * SCALE], radius=cr2 + 10 * SCALE, fill=(56, 189, 248, int(105 * c_alpha)))
            cg = cg.filter(ImageFilter.GaussianBlur(radius=int(16 * SCALE)))
            c_layer = Image.alpha_composite(c_layer, cg)
            
            cd = ImageDraw.Draw(c_layer)
            cd.rounded_rectangle([cl, ct, cr, cb], radius=cr2, fill=(13, 16, 26, int(240 * c_alpha)), outline=(125, 211, 252, int(180 * c_alpha)), width=int(2 * SCALE))
            
            icx = cl + int(30 * SCALE * c_sc)
            icy = cy2
            ir = int(9 * SCALE * c_sc)
            cd.ellipse([icx - ir, icy - ir, icx + ir, icy + ir], outline=(255, 255, 255, int(230 * c_alpha)), width=int(2 * SCALE))
            cd.line([(icx + int(ir * 0.7), icy + int(ir * 0.7)), (icx + int(ir * 1.5), icy + int(ir * 1.5))], fill=(255, 255, 255, int(230 * c_alpha)), width=int(2 * SCALE))
            
            disp_txt = url_target[:t_len]
            cd.text((icx + int(20 * SCALE * c_sc), cy2 - int(13 * SCALE * c_sc)), disp_txt, font=font_url_sq, fill=(147, 197, 253, int(245 * c_alpha)))
            
            if cur_on and (f_idx >= 27) and (c_alpha > 0.5):
                bb = font_url_sq.getbbox(disp_txt) if disp_txt else [0, 0, 0, 0]
                cur_x = icx + int(20 * SCALE * c_sc) + (bb[2] - bb[0]) + int(3 * SCALE)
                cd.line([(cur_x, cy2 - int(10 * SCALE)), (cur_x, cy2 + int(10 * SCALE))], fill=(255, 255, 255, int(230 * c_alpha)), width=int(2 * SCALE))
                
            bg2 = Image.alpha_composite(bg2, c_layer)
            
        final_icon = bg2.resize((W2, H2), Image.Resampling.LANCZOS)
        q_icon = final_icon.convert("RGB").quantize(colors=256)
        frames_icon.append(q_icon)
        
    icon_path = os.path.join(OUTPUT_DIR, "closydev-discord-icon.gif")
    icon_artifact = os.path.join(ARTIFACTS_DIR, "closydev-discord-icon.gif")
    frames_icon[0].save(icon_path, save_all=True, append_images=frames_icon[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    frames_icon[0].save(icon_artifact, save_all=True, append_images=frames_icon[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    print(f"Lightning Icon generated: {icon_path} ({os.path.getsize(icon_path) / 1024:.1f} KB)")

if __name__ == "__main__":
    generate_discord_banner_and_icon()
