# Solar 2 — bản tái dựng web cho AI Studio (0.1)

## Trạng thái chính xác
Đây là bản game web **viết lại bằng JavaScript**, KHÔNG phải bản chuyển đổi toàn bộ Solar 2 và KHÔNG phải mã nguồn C# đã dịch ngược hoàn chỉnh. APK đầu vào dùng Mono/.NET + MonoGame. Các assembly Android không thể chạy trực tiếp trên trình duyệt. Đồ họa XNB gốc chưa được giải nén/chuyển sang ảnh web; giao diện và thiên thể hiện được vẽ mới bằng Canvas 2D.

## Đã có
- Không gian 2D với camera đi theo người chơi, kéo cảm ứng, WASD/phím mũi tên, thu phóng.
- Bắt thiên thể nhỏ vào quỹ đạo; hấp thụ bằng nút hoặc Space.
- 5 trạng thái: tiểu hành tinh, hành tinh, sao, sao neutron, hố đen; Big Bang và bắt đầu chu kỳ mới.
- Lực hút đơn giản, va chạm mất khối lượng, quỹ đạo, chỉ số sự sống đơn giản.
- 6 mục tiêu tiến trình mới (không phải nhiệm vụ gốc).
- Tạm dừng, tự lưu mỗi 10 giây khi chơi, xuất/nhập save JSON có kiểm tra dữ liệu.
- Nhạc và 3 hiệu ứng âm thanh trích từ APK. Chỉ bật khi người chơi nhấn Âm thanh.
- Game không gọi Gemini/OpenAI, không cần API key, không tải CDN. Tài nguyên lấy từ chính máy chủ dự án. Chạy được khi không có Internet nếu máy chủ cục bộ đang chạy.

## Chưa có — cần tiếp tục chuyển đổi
- Logic gốc từ Solar2.Android.dll chưa được decompile và port.
- Chiến dịch, thử thách, hội thoại, boss, thành tựu gốc chưa được nối.
- Chưa có AI hạm đội, đạn/tên lửa, lá chắn, tháp pháo và chiến đấu gốc.
- Chưa có hệ nhiều sao đúng bản gốc, cây phát triển sự sống gốc và toàn bộ loại thiên thể gốc.
- Quỹ đạo, thông số khối lượng, điều kiện tiến hóa là cấu hình mới, chưa đối chiếu chính xác với C#.
- Chưa chuyển texture atlas XNB, font, shader, hoạt cảnh gốc.
- Chỉ số sự sống hiện là mô phỏng đơn giản, không phải nền văn minh có AI.
- Không có service worker: trang đã đóng không tự mở offline từ URL trên mạng. Muốn offline, chạy máy chủ cục bộ.

## Chạy và build
Yêu cầu Node.js 18 trở lên. Không có dependency npm.

    npm run dev

Mặc định cổng 3000, bind 0.0.0.0. Có thể đặt PORT hoặc thêm --port:

    npm run dev -- --port 3000
    npm test
    npm run build
    npm run preview

`npm run build` tạo thư mục `dist/` chỉ chứa game và âm thanh cần thiết. Không đưa DLL hoặc dữ liệu tham khảo vào bản web chạy thật.

## Đưa vào dự án AI Studio
Đây là source project web thông thường, không phải APK để cài trong AI Studio. Dùng phương thức nhập source/GitHub mà giao diện tài khoản của bạn cung cấp, hoặc đưa các tệp source vào dự án. Giữ package.json và index.html ở thư mục gốc. Cấu hình:
- Start/dev: npm run dev
- Build: npm run build
- Output: dist
- Runtime Node: 18+

Không cần đưa `reference/` vào thư mục public. Có thể giữ thư mục này ngoài GitHub nếu muốn repo nhẹ; bản ZIP vẫn giữ tài nguyên gốc để đối chiếu sau. Xem `AI_STUDIO_PROMPT.txt` để yêu cầu AI tiếp tục đúng phạm vi.

Chưa kiểm tra trực tiếp việc nhập/chạy bên trong tài khoản Google AI Studio của bạn. Build cục bộ không chứng minh mọi cơ chế nhập của AI Studio đều tương thích.

## Cấu trúc
- index.html, style.css: UI tiếng Việt và responsive.
- src/engine.js: trạng thái, vật lý đơn giản, tiến hóa, save.
- src/main.js: Canvas, input, audio, giao diện.
- public/audio/: 4 tài nguyên âm thanh đang dùng.
- tools/: máy chủ Node và script build không dùng framework.
- tests/: kiểm tra logic engine.
- reference/assets/: toàn bộ assets gốc từ APK.
- reference/assemblies/: các DLL .NET trích nguyên trạng.
- reference/apk-manifest.json: SHA-256 APK, tên/kích thước/hash 84 mục trong APK.
- reference/assembly-symbols.txt: tên ký hiệu đọc từ DLL, KHÔNG phải mã C#.
- CONVERSION_REPORT.md: báo cáo chuyển đổi và kiểm thử.

Âm thanh và tài nguyên gốc giữ quyền của tác giả Solar 2. Phần trích xuất không làm thay đổi quyền sở hữu tài nguyên.
