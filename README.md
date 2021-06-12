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

2. Nested argument
    - `@bot jimp -print "-text 'goblok teks'"
        - kata kunci `print` punya value `-text 'goblok teks'`
    
    - Karena nested, syntaxnya mirip sama kode program, tapi bracketnya gaboleh sama, ini agak ribet, tp kurleb gini
        - `@bot -b [] -tes [-another "-another2 '-b {} -another3 {tes}' " ]`
    - ya gitu lah wkwk, intinya biar ga konflik, tp sejauh ini nested argument yg ribet ini cuma kepake di fitur JIMP.

3. Boolean argument
    - `@bot jimp --new`
      - kata kunci `new` ngasih message boolean `true` ke command jimp.

### Daftar fitur

banyak
