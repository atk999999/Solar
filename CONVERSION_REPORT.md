# Báo cáo chuyển đổi

Đầu vào: com.murudai.Solar2_1.1.2-APK_Award.apk, 47.532.700 byte, 84 mục ZIP.

## Bằng chứng từ APK
- assemblies/Solar2.Android.dll: 494.592 byte.
- assemblies/MonoGame.Framework.dll: 687.104 byte.
- lib/armeabi-v7a/libmonodroid.so: 2.887.436 byte.
- Có Power.Android.dll, PowerRuntime.Android.dll, EasyStorage.Android.dll cùng thư viện .NET.
- Gameplay/gameplay.xnb và Backgrounds/backgrounds.xnb có header XNBw, phiên bản 5, cờ 0x80 (nén). Chưa giải mã texture/atlas.
- Có Languages/strung.en.txt, dữ liệu cutscene XML, nhạc OGG và hiệu ứng WAV.
- Tên ký hiệu trích từ DLL có AbsorbAllAsteroids, ActivateBlackHole, BinaryStar, BossMultiStar, Mission..., Ship..., v.v. Đây chỉ là bằng chứng tên, chưa phải logic được dịch ngược.

## Phương thức
Tách nguyên trạng toàn bộ assets và assemblies sang reference, tính hash từng mục. Viết engine Canvas/JavaScript riêng và tái sử dụng 4 âm thanh gốc. Không sửa APK. Không đưa native Android hoặc DLL vào dist.

## Mức độ hoàn thiện
Có một bản tái dựng web có thể build và có vòng chơi cơ bản. Chưa chuyển toàn bộ Solar 2. Không có cơ sở để đưa tỷ lệ phần trăm hoàn thành vì chưa kiểm kê toàn bộ hàm C# và nhiệm vụ gốc.

## Kiểm thử logic đã thực hiện
8/8 test Node.js đạt: ngưỡng tiến hóa; bắt quỹ đạo rồi hấp thụ; sao hấp thụ từng vật thể; va chạm/cooldown; Big Bang; vòng save/load; từ chối save lỗi; mô phỏng 12.000 bước giữ trạng thái hữu hạn và số lượng entity giới hạn.
Build npm run build thành công. node --check đạt cho engine và UI.

Các test này không chứng minh tương đương với game Android gốc. Chưa kiểm tra trong tài khoản Google AI Studio hoặc trên điện thoại thực.

## Kiểm thử trình duyệt
Chromium headless: desktop 1280×800 và viewport cảm ứng 390×844. Kiểm tra mở game, di chuyển bàn phím/cảm ứng, lưu localStorage, tải lại, giải mã/phát nhạc OGG và chụp ảnh giao diện. Không ghi nhận pageerror hoặc HTTP 4xx/5xx trong lượt kiểm tra đạt. Đã xem ảnh desktop và mobile; bổ sung nền tối cho bảng thông tin để chữ không lẫn với thiên thể phía sau.
