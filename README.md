# Goblokbot 1991

Powered by [Glitch](https://glitch.com)

Bot LINE serbaguna.

## Trivia
- Kenapa namanya goblokbot?
- Karena w awalnya pengen bikin bot buat nyepam stiker goblok, tapi dulu g kesampean dan ada keterbatasan dari LINE jadinya malah kek gini skrg.

# Cara pake
Ada beberapa hal penting mengenai bot ini sebelum dipake.
### Pesan
Pesan yang bisa diterima sama goblokbot adalah berikut

`[@bot/!] [command] [argumen]`

1. "@bot" / "!" itu prefix buat manggil botnya
    - Contoh: `@bot pap goblok` atau `!pap apel`
    - Bisa di-custom sama admin
2. command itu perintah buat botnya
    - Seperti contoh di atas, `pap` atau `kbbi` atau lainnya (list ada di bawah)
3. argumen itu pesan yang ingin disampaikan ke command barusan
    - Contoh mudah: `@bot kbbi apel` maka `apel` adalah argumennya.
       - Tapi itu argumen yang gak bounded atau gak terikat
    - Argumen yang terikat adalah yang diawalin sama prefix `-`
        - Contoh: `@bot yt -m 5 goblok video`
        - `goblok video` itu argumen yang unbounded, `5` itu argumen yang bounded dengan kata kunci `m`.
        - Cara penggunaan argumen bounded ini ada di bawah ntar.

### Argumen

Cara pake argumen ini sebenernya simple, langsung aja ke contoh

Btw, gak semua fitur / command pake bounded argument. Hampir semuanya pake yg unbound.

1. Simple argument
    - `@bot yt -m 5 opm` dengan kata kunci `m` adalah `5`.
    - `@bot yt -m "tes tis" opm` dengan kata kunci `m` adalah `tes tis`.
    - `@bot yt -m 'tes tis' opm` sama aja kek yg atas, tp beda bracket
    - `@bot yt -b $ -m $tes tis$` sama aja kek di atas, tp custom bracket pake $
    - `@bot yt -b {} -m {tes tis}` sama aja kek di atas, tp custom bracket open-close pake {}

2. Nested argument
    - `@bot jimp -print "-text 'goblok teks'"
        - kata kunci `print` punya value `-text 'goblok teks'`
    
    - Karena nested, syntaxnya mirip sama kode program, tapi bracketnya gaboleh sama, ini agak ribet, tp kurleb gini
        - `@bot -b [] -tes [-another "-another2 '-b {} -another3 {tes}' " ]`
    - ya gitu lah wkwk, intinya biar ga konflik, tp sejauh ini nested argument yg ribet ini cuma kepake di fitur JIMP.

3. Boolean argument
    - `@bot jimp --new`
      - kata kunci `new` ngasih message boolean `true` ke command jimp.

### Fitur lain

1. Multiple command

    - Contoh: `@bot yt tes ; !pap tes ; !c` bakal ngirim 3 command (berurutan) `yt, pap, c`. Maksimal 5 reply / bubble.

2. Multiple "arg" in 1 command

    - Contoh: `@bot pap tes ;; tis` sama aja kyk `@bot pap tes ; @bot pap tis`. Maksimal 5 reply / bubble.

3. Call last command

    - Pake prefix `!!`. Contoh command terakhir itu pap, jadi `!! tes` sama aja kyk `@bot pap tes`

4. WEBSITE

    - Website goblokbot bisa dipake buat liat grafik latency, liat history chat, liat daftar user, sama request fitur baru.
    - Buat admin, admin bisa ban orang lewat web, bisa liat message yg di-unsend, bisa accept/delete fitur yg di-request.
    
### Daftar fitur

banyak, cek folder **bot/features/mustcall** dan **bot/features/mustntcall** dan file **db/customcmd.json** kalo ada.
