## Mau pake sendiri atau kontribusi?
Ada beberapa hal penting yang harus dicatet sebelum kontribusi atau pake bot ini sendiri

1. SEMUA DATABASE yang dipake bot ini adalah **LOKAL**, jadi kalo tempat lu deploy kaga support database lokal (gabisa simpen state / ga support persistent storage)
unfortunately, gabisa dipake, dbnya bakal kereset terus.
Saran w bisa dideploy di Glitch, tapi Glitch sering sleep programnya, bikin balesan jadi lemot.

    1.1. BOT INI DIDESAIN KHUSUS UNTUK BISA DIPAKE DI 1 GROUP / 1 ROOM / 1 ORANG AJA.
    Contoh: ketika didaftarkan ke 1 grup/room, maka cuma bisa dipake di situ aja + membernya. Ketika didaftarin sendiri, maka cuma lu sendiri yang bisa pake.

2. Setup OA line, bikin channel LINE Messaging API sama LINE Login di Provider yang sama. Ini liat google aja bisa. Jangan lupa register `https://web-lu.com/chat/callback` buat LINE Messaging API Webhook URL sama `https://web-lu.com/auth/callback` buat LINE Login Callback URL.

### CATATAN: STEP DI BAWAH MENGASUMSIKAN LU DEPLOY DI GLITCH.COM
- Kalo ngga, step ini berasumsi tempat deploy bisa baca .env, kalo ngga, bisa menyesuaikan.

3. Edit file `.env.example` dan isi dengan field yang sesuai, kalo gatau / gakepake, isi "-" aja dulu.

isi dotenv:
```
linechat_token= // access token OA
linechat_secret= // secret key OA
login_appid= // id aplikasi line login
login_callback= // url callback yg td didaftarin
login_secret= // secret key aplikasi login
imgbbkey= // api key imgbb buat upload gambar, bisa bikin di imgbb
```

di bawah ini buat fitur2, kl gamau pake, isi "-" aja dulu

```
yts_api= // api key buat fitur yt, ytr, yts, nijisanji
pap_key= // api key buat pap
pap_api_key= // api key buat pap
newsapikey= // api key buat news API
opmkey= // secret key buat opm webhook (update chapter opm)
```

4. Rename `.env.example` jadi `.env`.

5. Kalo bukan deploy di Glitch, jalanin `npm install` dan `npm start`. (kalo di Glitch udah otomatis, step ini bisa skip).

6. Kalo udah, coba add bot dan kirim pesan `!register`, Bot akan membuat folder `db` dan sebagian isinya juga mendaftarkan id lu. (kalo kirim di grup/room bakal daftarin grup/roomnya termasuk lu)

7. Done.
  
8. Cara nambah fitur ada 3 cara

Utk 2 cara pertama, setiap file fitur harus di-exports berupa fungsi yang berparameter **(parsed, event, bot)** (bisa fungsi biasa/async), luarannya harus berupa **line message object** (single object / array of object), tinggal ikutin file yg udah ada aja templatenya.

1. Parsed adalah object yang isinya hasil parsing chat user, isinya bisa dicek di file `parser.js`. 
2. Event adalah **Event Object** (bisa liat dokumentasi LINE).
3. Bot adalah object yang isinya fungsi dan fitur bot itu sendiri. (bot[mustcall/mustntcall][namafitur] dan bot[function][exec/execMultiple]). Bisa dicek di `bot/command/text.js`

- utk fitur yg mesti pake prefiks, tinggal tambahin file javascript baru di folder `bot/features/mustcall/`

- utk fitur yg ga mesti pake prefiks, tinggal tambahin file javascript baru di folder `bot/features/mustntcall/`  

- cara ketiga adalah dengan pake layanan custom fitur di web (/command)