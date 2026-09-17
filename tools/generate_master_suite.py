import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = r'C:\Users\zeybe\.gemini\antigravity\scratch\digital-store'
ARTIFACTS_DIR = r'C:\Users\zeybe\.gemini\antigravity\brain\fd1fb7f0-0c0d-4861-b985-a148530e1c04'
font_bold_path = r'C:\Windows\Fonts\segoeuib.ttf'

SCALE = 2
NUM_FRAMES = 54
DURATION = 42

raw_bolt = [(13, 2), (3.5, 13.5), (11.5, 13.5), (10, 22), (20.5, 10.5), (12.5, 10.5)]

def draw_3d_bolt(draw, cx, cy, scale_b, alpha_fac=1.0):
    def pt(x, y):
        return (int(cx + (x - 12.0) * scale_b), int(cy + (y - 12.0) * scale_b))
    p0 = pt(13, 2)
    p1 = pt(3.5, 13.5)
    p2 = pt(11.5, 13.5)
    p3 = pt(10, 22)
    p4 = pt(20.5, 10.5)
    p5 = pt(12.5, 10.5)
    p_mid = pt(12.0, 12.0)
    
    a_w = int(255 * alpha_fac)
    a_sil = int(220 * alpha_fac)
    a_shad = int(240 * alpha_fac)
    a_tit = int(240 * alpha_fac)
    
    draw.polygon([p0, p1, p2, p_mid], fill=(255, 255, 255, a_w))
    draw.polygon([p2, p3, p_mid], fill=(215, 225, 238, a_sil))
    draw.polygon([p3, p4, p_mid], fill=(70, 95, 125, a_shad))
    draw.polygon([p4, p5, p0, p_mid], fill=(125, 150, 180, a_tit))
    
    draw.line([p0, p_mid], fill=(255, 255, 255, int(230 * alpha_fac)), width=int(1.8 * SCALE))
    draw.line([p_mid, p3], fill=(255, 255, 255, int(230 * alpha_fac)), width=int(1.8 * SCALE))
    draw.line([p2, p_mid], fill=(255, 255, 255, int(180 * alpha_fac)), width=int(1.2 * SCALE))
    draw.line([p4, p_mid], fill=(200, 225, 255, int(150 * alpha_fac)), width=int(1.2 * SCALE))

def get_perimeter_points(w, h, r, num_pts=200):
    straight_w = w - 2 * r
    straight_h = h - 2 * r
    total_perim = 2 * straight_w + 2 * straight_h + 2 * math.pi * r
    pts = []
    for i in range(num_pts):
        d = (i / num_pts) * total_perim
        if d < straight_w:
            pts.append((r + d, 0))
            continue
        d -= straight_w
        arc_len = 0.5 * math.pi * r
        if d < arc_len:
            ang = -0.5 * math.pi + (d / arc_len) * 0.5 * math.pi
            pts.append((w - r + r * math.cos(ang), r + r * math.sin(ang)))
            continue
        d -= arc_len
        if d < straight_h:
            pts.append((w, r + d))
            continue
        d -= straight_h
        if d < arc_len:
            ang = 0 + (d / arc_len) * 0.5 * math.pi
            pts.append((w - r + r * math.cos(ang), h - r + r * math.sin(ang)))
            continue
        d -= arc_len
        if d < straight_w:
            pts.append((w - r - d, h))
            continue
        d -= straight_w
        if d < arc_len:
            ang = 0.5 * math.pi + (d / arc_len) * 0.5 * math.pi
            pts.append((r + r * math.cos(ang), h - r + r * math.sin(ang)))
            continue
        d -= arc_len
        if d < straight_h:
            pts.append((0, h - r - d))
            continue
        d -= straight_h
        ang = math.pi + (d / arc_len) * 0.5 * math.pi
        pts.append((r + r * math.cos(ang), r + r * math.sin(ang)))
    return pts

# ====================================================================
# 1. GENERATE 16:9 BANNER WITH SPINNING ENTRANCE & ROTATING BORDER BEAM
# ====================================================================
print('Generating Master 16:9 Banner with Spinning Entrance & Rotating Light...')
W, H = 960, 540
SW, SH = W * SCALE, H * SCALE
cx, cy = SW // 2, SH // 2

font_logo = ImageFont.truetype(font_bold_path, int(92 * SCALE))
font_url = ImageFont.truetype(font_bold_path, int(29 * SCALE))

scale_b_banner = 5.2 * SCALE
bbox_t = font_logo.getbbox('closydev.')
text_w_ban = bbox_t[2] - bbox_t[0]
bolt_w_ban = int(17.0 * scale_b_banner)
gap_ban = int(36 * SCALE)
total_w_ban = bolt_w_ban + gap_ban + text_w_ban

url_target = 'discord.gg/closydev'
total_chars = len(url_target)

# Capsule dimensions
cw = int(570 * SCALE)
ch = int(68 * SCALE)
cr = ch // 2
cap_perim_pts = get_perimeter_points(cw, ch, cr, 240)

frames_banner = []

for f_idx in range(NUM_FRAMES):
    bg = Image.new('RGBA', (SW, SH), (4, 4, 6, 255))
    t = f_idx / NUM_FRAMES
    
    # Timeline:
    # 0..18: Scene 1 (3D Bevel Logo prominent)
    # 19..26: Transition 1 -> 2: Capsule SPINS and EXPANDS in! (Rotation -90 deg -> 0 deg, scale 0.25 -> 1.0)
    # 27..46: Scene 2 (Capsule typing, border beam spinning around border)
    # 47..53: Transition 2 -> 1: Capsule SPINS and shrinks out (Rotation 0 -> 90 deg, scale 1.0 -> 0.25)
    
    if f_idx <= 18:
        logo_alpha = 1.0
        logo_scale = 1.0 + 0.012 * math.sin(f_idx / 18.0 * math.pi)
        cap_active = False
        cap_scale = 0.0
        cap_rot = 0.0
        typed_len = 0
        show_cursor = False
    elif 19 <= f_idx <= 26:
        prog = (f_idx - 19) / 7.0
        ease = math.sin(prog * 0.5 * math.pi)
        logo_alpha = 1.0 - ease
        logo_scale = 1.0 - 0.15 * ease
        cap_active = True
        cap_alpha = ease
        cap_scale = 0.25 + 0.75 * ease
        cap_rot = -90.0 * (1.0 - ease)
        typed_len = 0
        show_cursor = True
    elif 27 <= f_idx <= 46:
        logo_alpha = 0.0
        logo_scale = 0.85
        cap_active = True
        cap_alpha = 1.0
        cap_scale = 1.0
        cap_rot = 0.0
        t_prog = min(1.0, (f_idx - 27) / 14.0)
        typed_len = int(math.ceil(t_prog * total_chars))
        show_cursor = ((f_idx // 3) % 2 == 0)
    else:
        prog = (f_idx - 47) / 6.0
        ease = math.sin(prog * 0.5 * math.pi)
        cap_active = True
        cap_alpha = 1.0 - ease
        cap_scale = 1.0 - 0.75 * ease
        cap_rot = 90.0 * ease
        logo_alpha = ease
        logo_scale = 0.85 + 0.15 * ease
        typed_len = total_chars
        show_cursor = True

    # ----------------------------------------------------
    # RENDER SCENE 1: 3D BEVEL KROM JİLET LOGO
    # ----------------------------------------------------
    if logo_alpha > 0.01:
        logo_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
        cur_total_w = int(total_w_ban * logo_scale)
        cur_bolt_w = int(bolt_w_ban * logo_scale)
        cur_gap = int(gap_ban * logo_scale)
        
        left_start = cx - cur_total_w // 2
        bolt_cx = left_start + cur_bolt_w // 2
        text_x = left_start + cur_bolt_w + cur_gap
        text_y = cy - int(60 * SCALE * logo_scale)
        
        # Ambient core glow
        bglow = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
        ImageDraw.Draw(bglow).ellipse([bolt_cx - int(75 * SCALE), cy - int(95 * SCALE), bolt_cx + int(75 * SCALE), cy + int(45 * SCALE)], fill=(56, 189, 248, int(90 * logo_alpha)))
        bglow = bglow.filter(ImageFilter.GaussianBlur(radius=int(26 * SCALE)))
        logo_layer = Image.alpha_composite(logo_layer, bglow)
        
        # Draw 3D Bolt
        bolt_canvas = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
        draw_3d_bolt(ImageDraw.Draw(bolt_canvas), bolt_cx, cy, scale_b_banner * logo_scale, logo_alpha)
        logo_layer = Image.alpha_composite(logo_layer, bolt_canvas)
        
        # Draw closydev. text
        txt_layer_ban = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
        a_int = int(255 * logo_alpha)
        ImageDraw.Draw(txt_layer_ban).text((text_x, text_y), 'closydev.', font=font_logo, fill=(255, 255, 255, a_int))
        
        # Liquid Chrome sheen across logo (strictly masked)
        combined_logo_ban = Image.alpha_composite(bolt_canvas, txt_layer_ban)
        logo_layer = Image.alpha_composite(logo_layer, combined_logo_ban)
        if f_idx <= 18:
            sheen_img = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
            sd = ImageDraw.Draw(sheen_img)
            shim_t = f_idx / 18.0
            shim_x = left_start - int(60 * SCALE) + int(shim_t * (cur_total_w + 120 * SCALE))
            sd.line([(shim_x, cy - int(90 * SCALE)), (shim_x + int(50 * SCALE), cy + int(90 * SCALE))], fill=(255, 255, 255, int(180 * logo_alpha)), width=int(18 * SCALE))
            sheen_img = sheen_img.filter(ImageFilter.GaussianBlur(radius=int(6 * SCALE)))
            sheen_arr = np.array(sheen_img)
            mask_arr = np.array(combined_logo_ban)
            sheen_arr[:, :, 3] = np.minimum(sheen_arr[:, :, 3], (mask_arr[:, :, 3].astype(float) * 0.45).astype(np.uint8))
            masked_sheen = Image.fromarray(sheen_arr, 'RGBA')
            logo_layer = Image.alpha_composite(logo_layer, masked_sheen)
            
        bg = Image.alpha_composite(bg, logo_layer)
        
    # ----------------------------------------------------
    # RENDER SCENE 2: ROTATING OPENING CAPSULE + ROTATING BORDER BEAM
    # ----------------------------------------------------
    if cap_active and cap_scale > 0.05:
        # Render capsule on its own canvas then rotate & scale
        pad = int(50 * SCALE)
        cap_w = cw + pad * 2
        cap_h = ch + pad * 2
        cap_canvas = Image.new('RGBA', (cap_w, cap_h), (0, 0, 0, 0))
        cd = ImageDraw.Draw(cap_canvas)
        
        # Capsule body
        cd.rounded_rectangle([pad, pad, pad + cw, pad + ch], radius=cr, fill=(15, 18, 28, int(245 * cap_alpha)), outline=(40, 55, 80, int(180 * cap_alpha)), width=int(2 * SCALE))
        
        # Magnifying glass
        icx = pad + int(42 * SCALE)
        icy = pad + cr
        ir = int(12.5 * SCALE)
        ic_alpha = int(240 * cap_alpha)
        cd.ellipse([icx - ir, icy - ir, icx + ir, icy + ir], outline=(255, 255, 255, ic_alpha), width=int(2.6 * SCALE))
        cd.line([(icx + int(ir * 0.7), icy + int(ir * 0.7)), (icx + int(ir * 1.6), icy + int(ir * 1.6))], fill=(255, 255, 255, ic_alpha), width=int(2.6 * SCALE))
        
        # Typewriter Text
        txt_x = pad + int(78 * SCALE)
        txt_y = pad + cr - int(20 * SCALE)
        disp_str = url_target[:typed_len]
        if show_cursor and (27 <= f_idx <= 46):
            disp_str += chr(124)
        cd.text((txt_x, txt_y), disp_str, font=font_url, fill=(186, 230, 253, int(245 * cap_alpha)))
        
        # Rotating Border Beam along the capsule perimeter!
        beam_head_norm = (f_idx * 2.2 / NUM_FRAMES) % 1.0
        num_pts = len(cap_perim_pts)
        head_idx = int(beam_head_norm * num_pts)
        beam_len_pts = int(num_pts * 0.30)
        
        beam_layer = Image.new('RGBA', (cap_w, cap_h), (0, 0, 0, 0))
        bd = ImageDraw.Draw(beam_layer)
        for b_i in range(beam_len_pts):
            frac = b_i / (beam_len_pts - 1)
            pt_idx = (head_idx - beam_len_pts + b_i) % num_pts
            pt_next = (pt_idx + 1) % num_pts
            p1 = (pad + cap_perim_pts[pt_idx][0], pad + cap_perim_pts[pt_idx][1])
            p2 = (pad + cap_perim_pts[pt_next][0], pad + cap_perim_pts[pt_next][1])
            b_alpha = int(255 * cap_alpha * (frac ** 1.6))
            r_col = int(56 * (1 - frac) + 255 * frac)
            g_col = int(189 * (1 - frac) + 255 * frac)
            b_col = 255
            bd.line([p1, p2], fill=(r_col, g_col, b_col, b_alpha), width=int(3.2 * SCALE))
            
        beam_glow = beam_layer.filter(ImageFilter.GaussianBlur(radius=int(6 * SCALE)))
        cap_canvas = Image.alpha_composite(cap_canvas, beam_glow)
        cap_canvas = Image.alpha_composite(cap_canvas, beam_layer)
        
        # Apply Rotation and Scaling to the capsule
        target_w = int(cap_w * cap_scale)
        target_h = int(cap_h * cap_scale)
        if target_w > 4 and target_h > 4:
            scaled_cap = cap_canvas.resize((target_w, target_h), Image.Resampling.BILINEAR)
            if abs(cap_rot) > 0.5:
                scaled_cap = scaled_cap.rotate(-cap_rot, resample=Image.Resampling.BICUBIC, expand=True)
            
            sc_w, sc_h = scaled_cap.size
            pos_x = cx - sc_w // 2
            pos_y = cy - sc_h // 2
            bg.alpha_composite(scaled_cap, (pos_x, pos_y))
            
    frame_final = bg.resize((W, H), Image.Resampling.LANCZOS).convert('RGB').quantize(colors=256)
    frames_banner.append(frame_final)

banner_path = os.path.join(OUTPUT_DIR, 'closydev-discord-banner.gif')
banner_artifact = os.path.join(ARTIFACTS_DIR, 'closydev-discord-banner.gif')
frames_banner[0].save(banner_path, save_all=True, append_images=frames_banner[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
frames_banner[0].save(banner_artifact, save_all=True, append_images=frames_banner[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
print(f'Banner saved: {banner_path} ({os.path.getsize(banner_path) / 1024:.1f} KB)')

# ====================================================================
# 2. GENERATE 1:1 SERVER ICON: GIANT 3D BEVEL KROM JİLET & DÖNEN LAZER ÇERÇEVE
# ====================================================================
print('Generating Master 1:1 Icon: Giant 3D Bevel Krom Jilet & Rotating Laser Beam...')
W2, H2 = 512, 512
SW2, SH2 = W2 * SCALE, H2 * SCALE
cx2, cy2 = SW2 // 2, SH2 // 2

scale_b_sq = 15.5 * SCALE
bolt_cy_sq = cy2
r_laser = int(225 * SCALE)
frames_icon = []

for f_idx in range(NUM_FRAMES):
    bg2 = Image.new('RGBA', (SW2, SH2), (4, 4, 6, 255))
    t = f_idx / NUM_FRAMES
    pulse = 1.0 + 0.018 * math.sin(t * 2 * math.pi)
    
    # 1. Rotating Circular Laser Beam Ring (Border Frame)
    laser_layer = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
    ld = ImageDraw.Draw(laser_layer)
    
    # Dotted/dashed thin background orbit track
    for deg in range(0, 360, 15):
        rad_d = math.radians(deg)
        dot_x = cx2 + r_laser * math.cos(rad_d)
        dot_y = cy2 + r_laser * math.sin(rad_d)
        ld.ellipse([dot_x - int(1.5*SCALE), dot_y - int(1.5*SCALE), dot_x + int(1.5*SCALE), dot_y + int(1.5*SCALE)], fill=(56, 189, 248, 50))
        
    # The intense orbiting laser streak
    beam_ang = t * 2 * math.pi * 1.5  # 1.5 rotations
    trail_len = math.radians(85)
    num_sub = 50
    for s_i in range(num_sub):
        frac = s_i / (num_sub - 1)
        ang_sub = beam_ang - (1.0 - frac) * trail_len
        ang_next = ang_sub + (trail_len / num_sub)
        p_x1 = cx2 + r_laser * math.cos(ang_sub)
        p_y1 = cy2 + r_laser * math.sin(ang_sub)
        p_x2 = cx2 + r_laser * math.cos(ang_next)
        p_y2 = cy2 + r_laser * math.sin(ang_next)
        
        alpha_l = int(255 * (frac ** 1.6))
        r_l = int(56 * (1 - frac) + 255 * frac)
        g_l = int(189 * (1 - frac) + 255 * frac)
        b_l = 255
        ld.line([(p_x1, p_y1), (p_x2, p_y2)], fill=(r_l, g_l, b_l, alpha_l), width=int(3.2 * SCALE))
        
    laser_glow = laser_layer.filter(ImageFilter.GaussianBlur(radius=int(6 * SCALE)))
    bg2 = Image.alpha_composite(bg2, laser_glow)
    bg2 = Image.alpha_composite(bg2, laser_layer)
    
    # 2. Ambient backlight behind giant 3D bolt
    bolt_glow = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
    ImageDraw.Draw(bolt_glow).ellipse([cx2 - int(140 * SCALE), cy2 - int(160 * SCALE), cx2 + int(140 * SCALE), cy2 + int(160 * SCALE)], fill=(56, 189, 248, 80))
    bolt_glow = bolt_glow.filter(ImageFilter.GaussianBlur(radius=int(38 * SCALE)))
    bg2 = Image.alpha_composite(bg2, bolt_glow)
    
    # 3. Draw Giant 3D Bevel Krom Jilet Bolt (No text)
    bolt_layer2 = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
    draw_3d_bolt(ImageDraw.Draw(bolt_layer2), cx2, bolt_cy_sq, scale_b_sq * pulse, 1.0)
    bg2 = Image.alpha_composite(bg2, bolt_layer2)
    
    # 4. Liquid chrome sheen sweep across giant bolt
    sheen_img = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sheen_img)
    shim_x = cx2 - int(240 * SCALE) + int(t * 480 * SCALE)
    sd.line([(shim_x, cy2 - int(200 * SCALE)), (shim_x + int(80 * SCALE), cy2 + int(200 * SCALE))], fill=(255, 255, 255, 255), width=int(24 * SCALE))
    sheen_img = sheen_img.filter(ImageFilter.GaussianBlur(radius=int(8 * SCALE)))
    
    # Mask sheen strictly to bolt alpha
    sheen_arr = np.array(sheen_img)
    mask_arr = np.array(bolt_layer2)
    sheen_arr[:, :, 3] = np.minimum(sheen_arr[:, :, 3], (mask_arr[:, :, 3].astype(float) * 0.45).astype(np.uint8))
    masked_sheen = Image.fromarray(sheen_arr, 'RGBA')
    bg2 = Image.alpha_composite(bg2, masked_sheen)
    
    frame_final2 = bg2.resize((W2, H2), Image.Resampling.LANCZOS).convert('RGB').quantize(colors=256)
    frames_icon.append(frame_final2)

icon_path = os.path.join(OUTPUT_DIR, 'closydev-discord-icon.gif')
icon_artifact = os.path.join(ARTIFACTS_DIR, 'closydev-discord-icon.gif')
frames_icon[0].save(icon_path, save_all=True, append_images=frames_icon[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
frames_icon[0].save(icon_artifact, save_all=True, append_images=frames_icon[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
print(f'Icon saved: {icon_path} ({os.path.getsize(icon_path) / 1024:.1f} KB)')

print('Master Suite generated successfully!')
