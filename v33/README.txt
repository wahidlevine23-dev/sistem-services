PT. INDAH PROJECT INDONESIA — Sistem Servis V3.3 (Multi-PC / LAN)

Tujuan:
V3.3 memindahkan penyimpanan data dari localStorage browser ke database terpusat di PC server, sehingga PC kantor dan laptop home service dapat mengakses DATA YANG SAMA melalui jaringan.

CARA SETUP DI PC KANTOR (SERVER)
1. Install Node.js LTS di PC kantor.
2. Extract folder ini, misalnya C:\IPI-Sistem-Servis-V3.3
3. Jalankan start-server.bat.
4. Di PC kantor buka http://localhost:8080
5. Cari IP PC kantor dengan CMD: ipconfig
6. Catat IPv4, contoh 192.168.1.10
7. Dari laptop yang berada di Wi-Fi/LAN yang sama buka: http://192.168.1.10:8080

PENTING:
- PC kantor harus menyala dan server harus berjalan agar laptop bisa akses data.
- PC kantor dan laptop harus berada di jaringan yang sama untuk akses LAN.
- Jika Windows Firewall bertanya, izinkan Node.js/private network.
- Database terpusat tersimpan di data/database.json.
- Backup database cukup dengan menyalin file data/database.json saat server berhenti.

MIGRASI DATA V3.2
Jika V3.2 pernah dipakai di PC kantor, V3.3 akan mengambil data localStorage lama secara bertahap ketika data tersebut dibaca, lalu menyimpannya ke server. Sebaiknya buka V3.3 di PC kantor terlebih dahulu sebelum laptop.

ARSITEKTUR DATA
Customer → Service Request → Device/Serial Number → Quotation → Invoice → Payment → Warranty → Report
Inventory → HPP → Invoice → COGS → Margin

CATATAN KEAMANAN
V3.3 adalah server LAN sederhana untuk penggunaan internal. Belum dirancang untuk dibuka langsung ke internet/public. Untuk akses dari luar kantor melalui internet, tahap berikutnya sebaiknya memakai VPN/HTTPS/authentication dan database server yang proper.
