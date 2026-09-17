import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUTPUT_DIR = r'C:\Users\zeybe\.gemini\antigravity\scratch\digital-store'
ARTIFACTS_DIR = r'C:\Users\zeybe\.gemini\antigravity\brain\fd1fb7f0-0c0d-4861-b985-a148530e1c04'
font_bold_path = r'C:\Windows\Fonts\segoeuib.ttf'

W, H = 512, 512
SCALE = 2
SW, SH = W * SCALE, H * SCALE
cx, cy = SW // 2, SH // 2

NUM_FRAMES = 48
DURATION = 42

font_logo = ImageFont.truetype(font_bold_path, int(58 * SCALE))
scale_b_base = 10.5 * SCALE
bolt_cy_base = int(205 * SCALE)
text_y_base = int(345 * SCALE)

raw_bolt = [(13, 2), (3.5, 13.5), (11.5, 13.5), (10, 22), (20.5, 10.5), (12.5, 10.5)]
norm_bolt = [((x - 12.0), (y - 12.0)) for x, y in raw_bolt]

bbox_t = font_logo.getbbox('closydev.')
text_w = bbox_t[2] - bbox_t[0]
text_x = cx - text_w // 2

def save_gif(frames, filename):
    p1 = os.path.join(OUTPUT_DIR, filename)
    p2 = os.path.join(ARTIFACTS_DIR, filename)
    frames[0].save(p1, save_all=True, append_images=frames[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    frames[0].save(p2, save_all=True, append_images=frames[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    print(f'{filename} saved: {os.path.getsize(p1) / 1024:.1f} KB')

# ====================================================================
# VARIATION 1: ELECTRIC ENERGY ARCS & NEON PULSE
# ====================================================================
print('Generating Variation 1: Electric Energy Arcs...')
frames_v1 = []
np.random.seed(42)

for f_idx in range(NUM_FRAMES):
    t = f_idx / NUM_FRAMES
    pulse = 1.0 + 0.02 * math.sin(t * 4 * math.pi)
    
    bg = Image.new('RGBA', (SW, SH), (4, 4, 6, 255))
    
    # Radial Shockwave Ripple
    wave_progress = (t * 2) % 1.0
    r_wave = int((80 + wave_progress * 180) * SCALE)
    w_alpha = int(120 * (1.0 - wave_progress))
    if w_alpha > 5:
        wave_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
        ImageDraw.Draw(wave_layer).ellipse([cx - r_wave, bolt_cy_base - r_wave, cx + r_wave, bolt_cy_base + r_wave], outline=(56, 189, 248, w_alpha), width=int(2.5 * SCALE))
        wave_layer = wave_layer.filter(ImageFilter.GaussianBlur(radius=int(6 * SCALE)))
        bg = Image.alpha_composite(bg, wave_layer)
        
    # Ambient Core Glow
    core_glow = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    cg_draw = ImageDraw.Draw(core_glow)
    cg_draw.ellipse([cx - int(100 * SCALE), bolt_cy_base - int(130 * SCALE), cx + int(100 * SCALE), bolt_cy_base + int(70 * SCALE)], fill=(56, 189, 248, 70))
    cg_draw.ellipse([cx - int(70 * SCALE), bolt_cy_base - int(100 * SCALE), cx + int(70 * SCALE), bolt_cy_base + int(40 * SCALE)], fill=(255, 255, 255, 90))
    core_glow = core_glow.filter(ImageFilter.GaussianBlur(radius=int(28 * SCALE)))
    bg = Image.alpha_composite(bg, core_glow)
    
    # Bolt & Text Mask
    scale_b = scale_b_base * pulse
    bolt_cy = bolt_cy_base * pulse
    b_pts = [(int(cx + x * scale_b), int(bolt_cy + y * scale_b)) for x, y in norm_bolt]
    
    logo_mask = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    lm_draw = ImageDraw.Draw(logo_mask)
    lm_draw.polygon(b_pts, fill=(255, 255, 255, 255))
    lm_draw.text((text_x, text_y_base), 'closydev.', font=font_logo, fill=(255, 255, 255, 255))
    
    # Electric Arcs / Sparks discharging around bolt
    spark_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    sp_draw = ImageDraw.Draw(spark_layer)
    # 3 dynamic spark lines
    for s_i in range(4):
        p_anchor = b_pts[(s_i * 2 + f_idx) % len(b_pts)]
        angle_s = (f_idx * 0.4 + s_i * 1.57)
        length_s = (25 + 15 * math.sin(f_idx * 1.2 + s_i)) * SCALE
        mid_x = p_anchor[0] + length_s * 0.5 * math.cos(angle_s) + np.random.uniform(-10, 10) * SCALE
        mid_y = p_anchor[1] + length_s * 0.5 * math.sin(angle_s) + np.random.uniform(-10, 10) * SCALE
        end_x = p_anchor[0] + length_s * math.cos(angle_s)
        end_y = p_anchor[1] + length_s * math.sin(angle_s)
        arc_col = (56, 189, 248, 220) if s_i % 2 == 0 else (192, 132, 252, 220)
        sp_draw.line([p_anchor, (mid_x, mid_y), (end_x, end_y)], fill=arc_col, width=int(2 * SCALE))
        
    spark_glow = spark_layer.filter(ImageFilter.GaussianBlur(radius=int(3 * SCALE)))
    bg = Image.alpha_composite(bg, spark_glow)
    bg = Image.alpha_composite(bg, spark_layer)
    
    # Masked Sheen sweep
    sheen_img = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(sheen_img)
    shim_x = cx - int(200 * SCALE) + int(t * 400 * SCALE)
    s_draw.line([(shim_x, cy - int(150 * SCALE)), (shim_x + int(70 * SCALE), cy + int(150 * SCALE))], fill=(255, 255, 255, 255), width=int(20 * SCALE))
    sheen_img = sheen_img.filter(ImageFilter.GaussianBlur(radius=int(8 * SCALE)))
    
    sheen_arr = np.array(sheen_img)
    mask_arr = np.array(logo_mask)
    sheen_arr[:, :, 3] = np.minimum(sheen_arr[:, :, 3], (mask_arr[:, :, 3].astype(float) * 0.40).astype(np.uint8))
    masked_sheen = Image.fromarray(sheen_arr, 'RGBA')
    logo_mask = Image.alpha_composite(logo_mask, masked_sheen)
    
    bg = Image.alpha_composite(bg, logo_mask)
    
    frame = bg.resize((W, H), Image.Resampling.LANCZOS).convert('RGB').quantize(colors=256)
    frames_v1.append(frame)

save_gif(frames_v1, 'closydev-icon-electric.gif')

# ====================================================================
# VARIATION 2: CYBER PORTAL & ROTATING HUD RING
# ====================================================================
print('Generating Variation 2: Cyber Portal & HUD Ring...')
frames_v2 = []

for f_idx in range(NUM_FRAMES):
    t = f_idx / NUM_FRAMES
    angle_rot = t * 2 * math.pi
    
    bg = Image.new('RGBA', (SW, SH), (4, 4, 6, 255))
    
    # Outer Rotating HUD Dashed Ring (radius ~ 230px in 512 -> 460px at SCALE 2)
    hud_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    h_draw = ImageDraw.Draw(hud_layer)
    
    r_outer = int(242 * SCALE)
    r_inner = int(232 * SCALE)
    
    # 24 rotating dashed segments
    num_segs = 24
    for i in range(num_segs):
        seg_angle = angle_rot + (i / num_segs) * 2 * math.pi
        a_deg = math.degrees(seg_angle)
        # Draw arc segments
        h_draw.arc([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], start=a_deg, end=a_deg + 9, fill=(56, 189, 248, 140), width=int(2 * SCALE))
        
    # Orbiting Energy Comets on inner ring
    for c_i in range(2):
        c_angle = -angle_rot * 1.5 + c_i * math.pi
        c_deg = math.degrees(c_angle)
        h_draw.arc([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], start=c_deg, end=c_deg + 45, fill=(192, 132, 252, 180), width=int(2.5 * SCALE))
        head_x = cx + r_inner * math.cos(c_angle + math.radians(45))
        head_y = cy + r_inner * math.sin(c_angle + math.radians(45))
        h_draw.ellipse([head_x - int(4 * SCALE), head_y - int(4 * SCALE), head_x + int(4 * SCALE), head_y + int(4 * SCALE)], fill=(255, 255, 255, 255))
        
    hud_glow = hud_layer.filter(ImageFilter.GaussianBlur(radius=int(4 * SCALE)))
    bg = Image.alpha_composite(bg, hud_glow)
    bg = Image.alpha_composite(bg, hud_layer)
    
    # Ambient Backlight
    core_glow = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    cg_draw = ImageDraw.Draw(core_glow)
    cg_draw.ellipse([cx - int(90 * SCALE), bolt_cy_base - int(120 * SCALE), cx + int(90 * SCALE), bolt_cy_base + int(60 * SCALE)], fill=(56, 189, 248, 80))
    core_glow = core_glow.filter(ImageFilter.GaussianBlur(radius=int(26 * SCALE)))
    bg = Image.alpha_composite(bg, core_glow)
    
    # Draw Logo
    b_pts = [(int(cx + x * scale_b_base), int(bolt_cy_base + y * scale_b_base)) for x, y in norm_bolt]
    logo_mask = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    lm_draw = ImageDraw.Draw(logo_mask)
    lm_draw.polygon(b_pts, fill=(255, 255, 255, 255))
    lm_draw.text((text_x, text_y_base), 'closydev.', font=font_logo, fill=(255, 255, 255, 255))
    
    # Specular Glint sweep
    sheen_img = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(sheen_img)
    shim_x = cx - int(180 * SCALE) + int(t * 360 * SCALE)
    s_draw.line([(shim_x, cy - int(140 * SCALE)), (shim_x + int(60 * SCALE), cy + int(140 * SCALE))], fill=(255, 255, 255, 255), width=int(18 * SCALE))
    sheen_img = sheen_img.filter(ImageFilter.GaussianBlur(radius=int(8 * SCALE)))
    
    sheen_arr = np.array(sheen_img)
    mask_arr = np.array(logo_mask)
    sheen_arr[:, :, 3] = np.minimum(sheen_arr[:, :, 3], (mask_arr[:, :, 3].astype(float) * 0.42).astype(np.uint8))
    masked_sheen = Image.fromarray(sheen_arr, 'RGBA')
    logo_mask = Image.alpha_composite(logo_mask, masked_sheen)
    
    bg = Image.alpha_composite(bg, logo_mask)
    frame = bg.resize((W, H), Image.Resampling.LANCZOS).convert('RGB').quantize(colors=256)
    frames_v2.append(frame)

save_gif(frames_v2, 'closydev-icon-portal.gif')

# ====================================================================
# VARIATION 3: HOLOGRAPHIC CHROME & RGB SPLIT GLITCH
# ====================================================================
print('Generating Variation 3: Holographic Chrome & RGB Split...')
frames_v3 = []

for f_idx in range(NUM_FRAMES):
    t = f_idx / NUM_FRAMES
    bg = Image.new('RGBA', (SW, SH), (4, 4, 6, 255))
    
    b_pts = [(int(cx + x * scale_b_base), int(bolt_cy_base + y * scale_b_base)) for x, y in norm_bolt]
    
    # Subtle background ambient
    core_glow = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    cg_draw = ImageDraw.Draw(core_glow)
    cg_draw.ellipse([cx - int(90 * SCALE), bolt_cy_base - int(120 * SCALE), cx + int(90 * SCALE), bolt_cy_base + int(60 * SCALE)], fill=(168, 85, 247, 85))
    core_glow = core_glow.filter(ImageFilter.GaussianBlur(radius=int(26 * SCALE)))
    bg = Image.alpha_composite(bg, core_glow)
    
    # Periodic chromatic aberration glitch (frames 14..17 and 34..37)
    is_glitch = (14 <= f_idx <= 17) or (34 <= f_idx <= 37)
    shift_px = int(7 * SCALE) if is_glitch else 0
    
    if is_glitch:
        # Red Channel Shifted Left
        r_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
        r_pts = [(p[0] - shift_px, p[1]) for p in b_pts]
        ImageDraw.Draw(r_layer).polygon(r_pts, fill=(239, 68, 68, 180))
        ImageDraw.Draw(r_layer).text((text_x - shift_px, text_y_base), 'closydev.', font=font_logo, fill=(239, 68, 68, 180))
        bg = Image.alpha_composite(bg, r_layer)
        
        # Cyan Channel Shifted Right
        c_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
        c_pts = [(p[0] + shift_px, p[1]) for p in b_pts]
        ImageDraw.Draw(c_layer).polygon(c_pts, fill=(56, 189, 248, 180))
        ImageDraw.Draw(c_layer).text((text_x + shift_px, text_y_base), 'closydev.', font=font_logo, fill=(56, 189, 248, 180))
        bg = Image.alpha_composite(bg, c_layer)
        
    # Main White Logo
    logo_mask = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    lm_draw = ImageDraw.Draw(logo_mask)
    lm_draw.polygon(b_pts, fill=(255, 255, 255, 255))
    lm_draw.text((text_x, text_y_base), 'closydev.', font=font_logo, fill=(255, 255, 255, 255))
    
    # Chrome spectrum reflection sweeping across
    chroma_img = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    ch_draw = ImageDraw.Draw(chroma_img)
    shim_x = cx - int(210 * SCALE) + int(t * 420 * SCALE)
    ch_draw.line([(shim_x - int(10 * SCALE), cy - int(150 * SCALE)), (shim_x + int(40 * SCALE), cy + int(150 * SCALE))], fill=(56, 189, 248, 220), width=int(12 * SCALE))
    ch_draw.line([(shim_x, cy - int(150 * SCALE)), (shim_x + int(50 * SCALE), cy + int(150 * SCALE))], fill=(255, 255, 255, 255), width=int(14 * SCALE))
    ch_draw.line([(shim_x + int(10 * SCALE), cy - int(150 * SCALE)), (shim_x + int(60 * SCALE), cy + int(150 * SCALE))], fill=(192, 132, 252, 220), width=int(12 * SCALE))
    chroma_img = chroma_img.filter(ImageFilter.GaussianBlur(radius=int(6 * SCALE)))
    
    c_arr = np.array(chroma_img)
    m_arr = np.array(logo_mask)
    c_arr[:, :, 3] = np.minimum(c_arr[:, :, 3], (m_arr[:, :, 3].astype(float) * 0.65).astype(np.uint8))
    masked_chroma = Image.fromarray(c_arr, 'RGBA')
    logo_mask = Image.alpha_composite(logo_mask, masked_chroma)
    
    bg = Image.alpha_composite(bg, logo_mask)
    frame = bg.resize((W, H), Image.Resampling.LANCZOS).convert('RGB').quantize(colors=256)
    frames_v3.append(frame)

save_gif(frames_v3, 'closydev-icon-chroma.gif')

# ====================================================================
# VARIATION 4: DUAL COLOR NEON PHASE SHIFT & SHOCKWAVE
# ====================================================================
print('Generating Variation 4: Dual Color Neon Phase Shift...')
frames_v4 = []

for f_idx in range(NUM_FRAMES):
    t = f_idx / NUM_FRAMES
    bg = Image.new('RGBA', (SW, SH), (4, 4, 6, 255))
    
    # Smooth Color Cycle: White -> Cyan -> Violet -> White
    # 0..0.33: White to Cyan
    # 0.33..0.66: Cyan to Violet
    # 0.66..1.0: Violet to White
    if t < 0.333:
        p = t / 0.333
        r_col = int(255 * (1 - p) + 56 * p)
        g_col = int(255 * (1 - p) + 189 * p)
        b_col = int(255 * (1 - p) + 248 * p)
    elif t < 0.666:
        p = (t - 0.333) / 0.333
        r_col = int(56 * (1 - p) + 192 * p)
        g_col = int(189 * (1 - p) + 132 * p)
        b_col = int(248 * (1 - p) + 252 * p)
    else:
        p = (t - 0.666) / 0.334
        r_col = int(192 * (1 - p) + 255 * p)
        g_col = int(132 * (1 - p) + 255 * p)
        b_col = int(252 * (1 - p) + 255 * p)
        
    dyn_color = (r_col, g_col, b_col, 255)
    
    # Dynamic Ambient Backlight matching dynamic color
    core_glow = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    cg_draw = ImageDraw.Draw(core_glow)
    cg_draw.ellipse([cx - int(110 * SCALE), bolt_cy_base - int(135 * SCALE), cx + int(110 * SCALE), bolt_cy_base + int(75 * SCALE)], fill=(r_col, g_col, b_col, 100))
    core_glow = core_glow.filter(ImageFilter.GaussianBlur(radius=int(32 * SCALE)))
    bg = Image.alpha_composite(bg, core_glow)
    
    # Concentric Dual Shockwaves
    for sw_i in range(2):
        sw_progress = ((t + sw_i * 0.5) % 1.0)
        sw_rad = int((70 + sw_progress * 190) * SCALE)
        sw_alpha = int(110 * (1.0 - sw_progress))
        if sw_alpha > 5:
            sw_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
            ImageDraw.Draw(sw_layer).ellipse([cx - sw_rad, bolt_cy_base - sw_rad, cx + sw_rad, bolt_cy_base + sw_rad], outline=(r_col, g_col, b_col, sw_alpha), width=int(2 * SCALE))
            sw_layer = sw_layer.filter(ImageFilter.GaussianBlur(radius=int(5 * SCALE)))
            bg = Image.alpha_composite(bg, sw_layer)
            
    # Draw Logo with dynamic phase color
    b_pts = [(int(cx + x * scale_b_base), int(bolt_cy_base + y * scale_b_base)) for x, y in norm_bolt]
    logo_mask = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    lm_draw = ImageDraw.Draw(logo_mask)
    lm_draw.polygon(b_pts, fill=dyn_color)
    lm_draw.text((text_x, text_y_base), 'closydev.', font=font_logo, fill=(255, 255, 255, 255))
    
    # Diamond Specular Sparkle on bolt tip (vertex 0)
    tip_pt = b_pts[0]
    sparkle_size = int((8 + 6 * math.sin(t * 6 * math.pi)) * SCALE)
    sp_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
    sp_d = ImageDraw.Draw(sp_layer)
    sp_d.line([(tip_pt[0] - sparkle_size, tip_pt[1]), (tip_pt[0] + sparkle_size, tip_pt[1])], fill=(255, 255, 255, 240), width=int(2 * SCALE))
    sp_d.line([(tip_pt[0], tip_pt[1] - sparkle_size), (tip_pt[0], tip_pt[1] + sparkle_size)], fill=(255, 255, 255, 240), width=int(2 * SCALE))
    sp_layer = sp_layer.filter(ImageFilter.GaussianBlur(radius=int(2 * SCALE)))
    logo_mask = Image.alpha_composite(logo_mask, sp_layer)
    
    bg = Image.alpha_composite(bg, logo_mask)
    frame = bg.resize((W, H), Image.Resampling.LANCZOS).convert('RGB').quantize(colors=256)
    frames_v4.append(frame)

save_gif(frames_v4, 'closydev-icon-phase.gif')

# Also update the default closydev-discord-icon.gif with Variation 1 (Electric Energy)
save_gif(frames_v1, 'closydev-discord-icon.gif')
print('All 4 icon variations rendered and saved successfully!')
