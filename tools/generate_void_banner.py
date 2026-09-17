import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def generate_void_banner_and_icon():
    OUTPUT_DIR = r'C:\Users\zeybe\.gemini\antigravity\scratch\digital-store'
    ARTIFACTS_DIR = r'C:\Users\zeybe\.gemini\antigravity\brain\fd1fb7f0-0c0d-4861-b985-a148530e1c04'
    font_bold_path = r'C:\Windows\Fonts\segoeuib.ttf'
    
    W, H = 960, 540
    SCALE = 2
    SW, SH = W * SCALE, H * SCALE
    NUM_FRAMES = 54
    DURATION = 42
    
    font_logo = ImageFont.truetype(font_bold_path, int(92 * SCALE))
    font_url = ImageFont.truetype(font_bold_path, int(29 * SCALE))
    
    raw_bolt = [(13, 2), (3.5, 13.5), (11.5, 13.5), (10, 22), (20.5, 10.5), (12.5, 10.5)]
    norm_bolt = [((x - 12.0), (y - 12.0)) for x, y in raw_bolt]
    
    url_target = 'discord.gg/closydev'
    total_chars = len(url_target)
    cx, cy = SW // 2, SH // 2
    frames_banner = []
    
    scale_b_banner_base = 5.2 * SCALE
    bbox_t_ban = font_logo.getbbox('closydev.')
    text_w_ban = bbox_t_ban[2] - bbox_t_ban[0]
    bolt_w_ban = int(17.0 * scale_b_banner_base)
    gap_ban = int(36 * SCALE)
    total_w_ban = bolt_w_ban + gap_ban + text_w_ban
    
    for f_idx in range(NUM_FRAMES):
        bg = Image.new('RGBA', (SW, SH), (4, 4, 6, 255))
        
        if f_idx <= 19:
            logo_alpha = 1.0
            logo_scale = 1.0 + 0.012 * math.sin(f_idx / 19.0 * math.pi)
            capsule_alpha = 0.0
            capsule_scale = 0.92
            typed_len = 0
            show_cursor = True
        elif 20 <= f_idx <= 24:
            prog = (f_idx - 20) / 4.0
            logo_alpha = 1.0 - prog
            logo_scale = 1.0 - 0.08 * prog
            capsule_alpha = prog
            capsule_scale = 0.92 + 0.08 * prog
            typed_len = 0
            show_cursor = True
        elif 25 <= f_idx <= 46:
            logo_alpha = 0.0
            logo_scale = 0.92
            capsule_alpha = 1.0
            capsule_scale = 1.0
            type_prog = min(1.0, (f_idx - 25) / 14.0)
            typed_len = int(math.ceil(type_prog * total_chars))
            show_cursor = ((f_idx // 3) % 2 == 0)
        else:
            prog = (f_idx - 47) / 6.0
            capsule_alpha = 1.0 - prog
            capsule_scale = 1.0 - 0.08 * prog
            logo_alpha = prog
            logo_scale = 0.92 + 0.08 * prog
            typed_len = total_chars
            show_cursor = True
            
        if logo_alpha > 0.01:
            logo_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
            scale_b = scale_b_banner_base * logo_scale
            cur_bolt_w = int(17.0 * scale_b)
            cur_gap = int(36 * SCALE * logo_scale)
            cur_text_w = int(text_w_ban * logo_scale)
            cur_total_w = cur_bolt_w + cur_gap + cur_text_w
            
            left_start = cx - cur_total_w // 2
            bolt_cx = left_start + cur_bolt_w // 2
            text_x = left_start + cur_bolt_w + cur_gap
            text_y = cy - int(60 * SCALE * logo_scale)
            
            b_pts = [(int(bolt_cx + x * scale_b), int(cy + y * scale_b)) for x, y in norm_bolt]
            
            bolt_glow = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
            bg_draw = ImageDraw.Draw(bolt_glow)
            bg_draw.ellipse([bolt_cx - int(60 * SCALE), cy - int(85 * SCALE), bolt_cx + int(60 * SCALE), cy + int(35 * SCALE)], fill=(255, 255, 255, int(95 * logo_alpha)))
            bolt_glow = bolt_glow.filter(ImageFilter.GaussianBlur(radius=int(28 * SCALE)))
            logo_layer = Image.alpha_composite(logo_layer, bolt_glow)
            
            logo_mask = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
            lm_draw = ImageDraw.Draw(logo_mask)
            alpha_int = int(255 * logo_alpha)
            lm_draw.polygon(b_pts, fill=(255, 255, 255, alpha_int))
            lm_draw.text((text_x, text_y), 'closydev.', font=font_logo, fill=(255, 255, 255, alpha_int))
            
            if f_idx <= 19 and logo_alpha > 0.5:
                sheen_img = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
                s_draw = ImageDraw.Draw(sheen_img)
                shim_t = f_idx / 19.0
                shim_x = left_start - int(50 * SCALE) + int(shim_t * (cur_total_w + 100 * SCALE))
                s_draw.line([(shim_x, cy - int(85 * SCALE)), (shim_x + int(45 * SCALE), cy + int(85 * SCALE))], fill=(255, 255, 255, 255), width=int(16 * SCALE))
                sheen_img = sheen_img.filter(ImageFilter.GaussianBlur(radius=int(6 * SCALE)))
                
                sheen_arr = np.array(sheen_img)
                mask_arr = np.array(logo_mask)
                sheen_arr[:, :, 3] = np.minimum(sheen_arr[:, :, 3], (mask_arr[:, :, 3].astype(float) * 0.45).astype(np.uint8))
                masked_sheen = Image.fromarray(sheen_arr, 'RGBA')
                logo_mask = Image.alpha_composite(logo_mask, masked_sheen)
                
            logo_layer = Image.alpha_composite(logo_layer, logo_mask)
            bg = Image.alpha_composite(bg, logo_layer)
            
        if capsule_alpha > 0.01:
            cap_layer = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
            cw = int(560 * SCALE * capsule_scale)
            ch = int(68 * SCALE * capsule_scale)
            cradius = ch // 2
            c_left = cx - cw // 2
            c_top = cy - ch // 2
            c_right = cx + cw // 2
            c_bottom = cy + ch // 2
            
            cap_glow = Image.new('RGBA', (SW, SH), (0, 0, 0, 0))
            cg_draw = ImageDraw.Draw(cap_glow)
            glow_pad = int(20 * SCALE)
            cg_draw.rounded_rectangle([c_left - glow_pad, c_top - glow_pad, c_right + glow_pad, c_bottom + glow_pad], radius=cradius + glow_pad, fill=(56, 189, 248, int(105 * capsule_alpha)))
            cap_glow = cap_glow.filter(ImageFilter.GaussianBlur(radius=int(26 * SCALE)))
            cap_layer = Image.alpha_composite(cap_layer, cap_glow)
            
            c_draw = ImageDraw.Draw(cap_layer)
            c_alpha = int(245 * capsule_alpha)
            b_alpha = int(150 * capsule_alpha)
            c_draw.rounded_rectangle([c_left, c_top, c_right, c_bottom], radius=cradius, fill=(17, 20, 30, c_alpha), outline=(56, 189, 248, b_alpha), width=int(1.8 * SCALE))
            
            icon_cx = c_left + int(42 * SCALE * capsule_scale)
            icon_cy = cy
            ir = int(12.5 * SCALE * capsule_scale)
            c_draw.ellipse([icon_cx - ir, icon_cy - ir, icon_cx + ir, icon_cy + ir], outline=(255, 255, 255, int(235 * capsule_alpha)), width=int(2.6 * SCALE))
            c_draw.line([(icon_cx + int(ir * 0.7), icon_cy + int(ir * 0.7)), (icon_cx + int(ir * 1.6), icon_cy + int(ir * 1.6))], fill=(255, 255, 255, int(235 * capsule_alpha)), width=int(2.6 * SCALE))
            
            text_x = c_left + int(78 * SCALE * capsule_scale)
            text_y = cy - int(20 * SCALE * capsule_scale)
            display_str = url_target[:typed_len]
            if show_cursor and (25 <= f_idx <= 48):
                display_str += chr(124)
            text_col = (186, 230, 253, int(245 * capsule_alpha))
            c_draw.text((text_x, text_y), display_str, font=font_url, fill=text_col)
            bg = Image.alpha_composite(bg, cap_layer)
            
        frame_final = bg.resize((W, H), Image.Resampling.LANCZOS).convert('RGB')
        quantized = frame_final.quantize(colors=256)
        frames_banner.append(quantized)
        
    banner_path = os.path.join(OUTPUT_DIR, 'closydev-discord-banner.gif')
    banner_artifact = os.path.join(ARTIFACTS_DIR, 'closydev-discord-banner.gif')
    frames_banner[0].save(banner_path, save_all=True, append_images=frames_banner[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    frames_banner[0].save(banner_artifact, save_all=True, append_images=frames_banner[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    print('Banner saved:', os.path.getsize(banner_path), 'bytes')
    
    W2, H2 = 512, 512
    SW2, SH2 = W2 * SCALE, H2 * SCALE
    cx2, cy2 = SW2 // 2, SH2 // 2
    
    font_logo_sq = ImageFont.truetype(font_bold_path, int(58 * SCALE))
    font_url_sq = ImageFont.truetype(font_bold_path, int(25 * SCALE))
    
    scale_b_sq_base = 10.5 * SCALE
    bolt_cy_base = int(205 * SCALE)
    text_y_base = int(345 * SCALE)
    
    frames_icon = []
    
    for f_idx in range(NUM_FRAMES):
        bg2 = Image.new('RGBA', (SW2, SH2), (4, 4, 6, 255))
        
        if f_idx <= 19:
            l_alpha = 1.0
            l_sc = 1.0 + 0.012 * math.sin(f_idx / 19.0 * math.pi)
            c_alpha = 0.0
            c_sc = 0.92
            t_len = 0
            cur_on = True
        elif 20 <= f_idx <= 24:
            prog = (f_idx - 20) / 4.0
            l_alpha = 1.0 - prog
            l_sc = 1.0 - 0.08 * prog
            c_alpha = prog
            c_sc = 0.92 + 0.08 * prog
            t_len = 0
            cur_on = True
        elif 25 <= f_idx <= 46:
            l_alpha = 0.0
            l_sc = 0.92
            c_alpha = 1.0
            c_sc = 1.0
            t_prog = min(1.0, (f_idx - 25) / 14.0)
            t_len = int(math.ceil(t_prog * total_chars))
            cur_on = ((f_idx // 3) % 2 == 0)
        else:
            prog = (f_idx - 47) / 6.0
            c_alpha = 1.0 - prog
            c_sc = 1.0 - 0.08 * prog
            l_alpha = prog
            l_sc = 0.92 + 0.08 * prog
            t_len = total_chars
            cur_on = True
            
        if l_alpha > 0.01:
            l_layer = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
            scale_b_sq = scale_b_sq_base * l_sc
            bolt_cy = bolt_cy_base * l_sc
            
            b_pts_sq = [(int(cx2 + x * scale_b_sq), int(bolt_cy + y * scale_b_sq)) for x, y in norm_bolt]
            
            bglow_sq = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
            ImageDraw.Draw(bglow_sq).ellipse([cx2 - int(90 * SCALE), int(bolt_cy - 120 * SCALE), cx2 + int(90 * SCALE), int(bolt_cy + 60 * SCALE)], fill=(255, 255, 255, int(95 * l_alpha)))
            bglow_sq = bglow_sq.filter(ImageFilter.GaussianBlur(radius=int(32 * SCALE)))
            l_layer = Image.alpha_composite(l_layer, bglow_sq)
            
            icon_mask = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
            im_draw = ImageDraw.Draw(icon_mask)
            a_int = int(255 * l_alpha)
            im_draw.polygon(b_pts_sq, fill=(255, 255, 255, a_int))
            
            bbox_t = font_logo_sq.getbbox('closydev.')
            w_text = bbox_t[2] - bbox_t[0]
            tx = cx2 - w_text // 2
            ty = int(text_y_base * l_sc)
            im_draw.text((tx, ty), 'closydev.', font=font_logo_sq, fill=(255, 255, 255, a_int))
            
            if f_idx <= 19 and l_alpha > 0.5:
                sheen_img = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
                s_draw = ImageDraw.Draw(sheen_img)
                shim_t = f_idx / 19.0
                shim_x = cx2 - int(180 * SCALE) + int(shim_t * 360 * SCALE)
                s_draw.line([(shim_x, cy2 - int(140 * SCALE)), (shim_x + int(60 * SCALE), cy2 + int(140 * SCALE))], fill=(255, 255, 255, 255), width=int(18 * SCALE))
                sheen_img = sheen_img.filter(ImageFilter.GaussianBlur(radius=int(8 * SCALE)))
                
                sheen_arr = np.array(sheen_img)
                mask_arr = np.array(icon_mask)
                sheen_arr[:, :, 3] = np.minimum(sheen_arr[:, :, 3], (mask_arr[:, :, 3].astype(float) * 0.45).astype(np.uint8))
                masked_sheen = Image.fromarray(sheen_arr, 'RGBA')
                icon_mask = Image.alpha_composite(icon_mask, masked_sheen)
                
            l_layer = Image.alpha_composite(l_layer, icon_mask)
            bg2 = Image.alpha_composite(bg2, l_layer)
            
        if c_alpha > 0.01:
            cap_layer2 = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
            cw2 = int(450 * SCALE * c_sc)
            ch2 = int(68 * SCALE * c_sc)
            cr2 = ch2 // 2
            c_left2 = cx2 - cw2 // 2
            c_top2 = cy2 - ch2 // 2
            c_right2 = cx2 + cw2 // 2
            c_bottom2 = cy2 + ch2 // 2
            
            cglow2 = Image.new('RGBA', (SW2, SH2), (0, 0, 0, 0))
            ImageDraw.Draw(cglow2).rounded_rectangle([c_left2 - int(16 * SCALE), c_top2 - int(16 * SCALE), c_right2 + int(16 * SCALE), c_bottom2 + int(16 * SCALE)], radius=cr2 + int(16 * SCALE), fill=(56, 189, 248, int(115 * c_alpha)))
            cglow2 = cglow2.filter(ImageFilter.GaussianBlur(radius=int(24 * SCALE)))
            cap_layer2 = Image.alpha_composite(cap_layer2, cglow2)
            
            cd2 = ImageDraw.Draw(cap_layer2)
            c2_alpha = int(245 * c_alpha)
            b2_alpha = int(160 * c_alpha)
            cd2.rounded_rectangle([c_left2, c_top2, c_right2, c_bottom2], radius=cr2, fill=(17, 20, 30, c2_alpha), outline=(56, 189, 248, b2_alpha), width=int(2.2 * SCALE))
            
            icx2 = c_left2 + int(38 * SCALE * c_sc)
            icy2 = cy2
            ir2 = int(12.5 * SCALE * c_sc)
            cd2.ellipse([icx2 - ir2, icy2 - ir2, icx2 + ir2, icy2 + ir2], outline=(255, 255, 255, int(235 * c_alpha)), width=int(2.8 * SCALE))
            cd2.line([(icx2 + int(ir2 * 0.7), icy2 + int(ir2 * 0.7)), (icx2 + int(ir2 * 1.6), icy2 + int(ir2 * 1.6))], fill=(255, 255, 255, int(235 * c_alpha)), width=int(2.8 * SCALE))
            
            txt_x2 = c_left2 + int(70 * SCALE * c_sc)
            txt_y2 = cy2 - int(18 * SCALE * c_sc)
            disp_str2 = url_target[:t_len]
            if cur_on and (25 <= f_idx <= 46):
                disp_str2 += chr(124)
            cd2.text((txt_x2, txt_y2), disp_str2, font=font_url_sq, fill=(186, 230, 253, int(245 * c_alpha)))
            bg2 = Image.alpha_composite(bg2, cap_layer2)
            
        frame_final2 = bg2.resize((W2, H2), Image.Resampling.LANCZOS).convert('RGB')
        quantized2 = frame_final2.quantize(colors=256)
        frames_icon.append(quantized2)
        
    icon_path = os.path.join(OUTPUT_DIR, 'closydev-discord-icon.gif')
    icon_artifact = os.path.join(ARTIFACTS_DIR, 'closydev-discord-icon.gif')
    frames_icon[0].save(icon_path, save_all=True, append_images=frames_icon[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    frames_icon[0].save(icon_artifact, save_all=True, append_images=frames_icon[1:], duration=DURATION, loop=0, disposal=2, optimize=True)
    print('Icon saved:', os.path.getsize(icon_path), 'bytes')

if __name__ == '__main__':
    generate_void_banner_and_icon()
