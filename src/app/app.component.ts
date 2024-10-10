import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  file: File | null = null;       // Tệp MP4 sẽ được lưu vào biến này
  base64String: string | null = null;  // Chuỗi Base64 sẽ được lưu vào đây

  // Hàm này được gọi khi người dùng chọn file
  onFileSelected(event: any) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.file = fileInput.files[0]; // Lưu tệp MP4 được chọn
    }
  }

  // Hàm này chuyển đổi tệp MP4 thành Base64
  convertToBase64() {
    if (!this.file) {
      return;
    }

    const reader = new FileReader();

    // Khi việc đọc file hoàn thành, chuỗi Base64 sẽ được lưu
    reader.onload = () => {
      const result = reader.result as string; // Chuỗi base64 của tệp
      this.base64String = result.split(',')[1]; // Chỉ lấy phần base64 (bỏ phần 'data:...')
    };

    // Đọc tệp dưới dạng DataURL (chuỗi base64)
    reader.readAsDataURL(this.file);
  }

  // Hàm này xử lý việc tải xuống file .txt với nội dung là chuỗi base64
  downloadBase64AsTxt() {
    if (!this.base64String) {
      return;
    }

    // Tạo nội dung blob cho file
    const blob = new Blob([this.base64String], { type: 'text/plain' });

    // Tạo URL từ blob để tải xuống
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'base64-output.txt'; // Tên file khi tải về

    // Kích hoạt quá trình tải xuống
    link.click();

    // Giải phóng bộ nhớ sau khi tải xuống
    window.URL.revokeObjectURL(link.href);
  }


  onFileTxtSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      // Đọc nội dung file .txt
      reader.onload = () => {
        this.base64String = reader.result as string;
      };

      // Đọc file dưới dạng text
      reader.readAsText(file);
    }
  }

  // Hàm này xử lý việc chuyển đổi chuỗi Base64 thành tệp MP4 và tải về
  convertToMP4() {
    if (!this.base64String) {
      return;
    }

    // Thêm tiền tố nếu không có (để chắc chắn đó là chuỗi base64 hợp lệ)
    const base64Data = `data:video/mp4;base64,${this.base64String.trim()}`;

    // Tạo Blob từ chuỗi Base64
    const blob = this.base64ToBlob(base64Data, 'video/mp4');

    // Tạo URL cho blob và kích hoạt việc tải về
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'converted-video.mp4'; // Tên file MP4 khi tải về
    link.click();

    // Giải phóng URL tạm
    window.URL.revokeObjectURL(link.href);
  }

  // Hàm chuyển chuỗi base64 thành Blob
  base64ToBlob(base64Data: string, contentType: string): Blob {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }
}
