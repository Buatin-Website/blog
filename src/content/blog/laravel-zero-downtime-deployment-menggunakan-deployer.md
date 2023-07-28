---
title: Laravel Zero Downtime Deployment Menggunakan Deployer
description: Deploy project Laravel dengan mudah dan cepat menggunakan Deployer
postSlug: laravel-zero-downtime-deployment-menggunakan-deployer
author: Andreas Asatera
pubDatetime: 2023-04-22T00:00:00+07:00
featured: false
draft: false
tags:
  - laravel
canonicalURL: https://blog.buatin.website/laravel-zero-downtime-deployment-menggunakan-deployer
---

_"Kak kenapa ya project saya ketika di akses di local bisa, tp waktu di upload ke hosting jadi tidak bisa di akses?"_

_"Kak ini cara uploadnya ke hosting sudah bener ya?"_

_"Kak kenapa asset-asset project saya tidak bisa di akses ya? padahal sudah saya buat symlink di laravelnya tapi masih gabisa di akses di hosting"_

Sering sekali penulis melihat pertanyaan-pertanyaan seperti di atas yang disebabkan oleh hal yang sama, yaitu cara deploy project Laravel ke hosting melalui cara yang belum tepat sehingga menimbulkan beberapa masalah yang terjadi meskipun ketika project di akses di local server tidak terjadi masalah apapun. Lebih parahnya lagi, dengan proses deployment yang kurang tepat dapat berdampak pada proses bisnis ketika project sudah digunakan oleh banyak user (server down, inkonsistensi data, dll)

Oleh karena itu penulis tertarik untuk memberikan tips bagaimana melakukan deploy project Laravel dengan mudah dan cepat serta tidak memberikan dampak negatif kepada user dengan menerapkan konsep _Zero Downtime Deployment_ menggunakan **Deployer**.

## Table of contents

## Apa itu _Zero Downtime Deployment_?

_Zero Downtime Deployment_ merupakan sebuah strategi untuk melakukan deploy ke server tanpa menyebabkan _downtime_ pada sistem agar pengguna tetap dapat melakukan aktivitasnya.

Pada strategi deploy yg sederhana, umumnya, metode deploy yang sederhana tahapannya:

1.  Akses server baik menggunakan FTP atau SSH
2.  Upload file / pull project dari git repository
3.  Merubah database sesuai dengan perubahan yang dilakukan

Dari tahapan di atas, tidak menutup kemungkinan akan timbul masalah ketika memproses langkah kedua menuju langkah ketiga, dimana file project sudah dilakukan pembaruan sedangkan database masih dalam proses pembaruan.

Misal pada pembaruan project, developer melakukan rename table dari "customer" ke "customers". Dari file project yang diperbarui sudah mencoba mencari table customers di database, tapi pada database belum dilakukan rename table. Maka akan terjadi error yang disebabkan table tidak ditemukan. Oleh karena itu terkadang developer mengatur website pada mode maintenance untuk melakukan pembaruan terlebih dahulu. Namun hal ini akan berdampak kepada _user experience_ yang turun dikarenakan user tidak dapat mengakses website saat dibutuhkan.

Mengatasi permasalahan tersebut, _Zero Downtime Deployment_ menjadi solusinya. Tahapan deploy pada strategi _Zero Downtime Deployment_ kurang lebih sebagai berikut:

1.  Sistem akan membuat 2 folder, yaitu folder _releases_ dan _current_. Folder releases akan berisi project yang kita deploy dan di simpan ke folder sesuai versi dari deployment yang kita lakukan. Folder tersebut bisa berupa tanggal deployment yang dilakukan atau versi berupa angka. Sedangkan folder current merupakan folder _symbolic link_ (symlink) dari release versi yang terbaru.
2.  Setiap melakukan deployment, sistem akan membuat release versi di folder releases. Kemudian sistem akan melakukan instalasi project mulai dari install package, compile asset, hingga migrate database.
3.  Apabila deployment berhasil, sistem akan memperbarui symlink menggunakan versi terbaru dari release.

Tahapan diatas memang sangat rumit, namun menggunakan **Deployer**, kita hanya membutuhkan beberapa baris kode untuk melakukan tahapan-tahapan diatas secara otomatis 😄

## **Deployer Requirements**

- Server yang dapat di akses menggunakan SSH
- Project yang sudah diletakkan pada git repository (github, gitlab, bitbucket, dll)

## **Install dan Konfigurasi Deployer**

Untuk menginstall deployer, ada cara yang dapat dilakukan:

- Composer

```bash
composer require deployer/deployer:^7.0
alias dep='vendor/bin/deployer.phar'
```

- Download manual

```bash
curl -LO https://deployer.org/deployer.phar
mv deployer.phar /usr/local/bin/dep
chmod +x /usr/local/bin/dep
```

Dalam artikel ini, penulis menggunakan deployer versi **7.0.0-rc.3**. Untuk versi lain yang dapat digunakan bisa langsung akses halaman [download](https://deployer.org/download).

Setelah proses instalasi berhasil, jalankan _command_ berikut untuk _generate_ konfigurasi deploy:

```bash
dep init
```

Command tersebut akan menanyakan beberapa hal, yaitu:

1.  Select recipe language: format dari file konfigurasi. Rekomendasi penulis yaitu menggunakan format **YAML**
2.  Select project template: template konfigurasi yang akan digunakan. Silahkan pilih template laravel
3.  Repository: remote url dari git repository. Apabila project sudah di inisiasi dengan git, maka akan otomatis terisi dan dapat langsung ke pertanyaan selanjutnya
4.  Project name: nama dari project yang sedang digunakan
5.  Hosts: isi dengan nama alias yang mudah di hafal. Misalkan: production, development, dsb

Apabila semua pertanyaan sudah dijawab, maka **Deployer** akan membuat satu file baru bernama **deploy.yaml** yang akan terlihat seperti ini:

```yaml
import:
  - recipe/laravel.php

config:
  repository: "git@github.com:Buatin-Website/blog-snippet.git"

hosts:
  dev:
    remote_user: deployer
    deploy_path: "~/buatin-blog-snippet"

tasks:
  build:
    - cd: "{{release_path}}"
    - run: "npm run build"

after:
  deploy:failed: deploy:unlock
```

## Penjelasan deploy.yaml

Sebelum kita lanjut pada bagaimana proses deploy menggunakan **Deployer**, penulis akan membahas terlebih dahulu mengenai file **deploy.yaml.**

- **import**

Bagian ini berfungsi untuk developer menambahkan file "template" yang dapat digunakan dalam proses deploy. **Deployer** menyebut file template tersebut sebagai **recipe**.

Pada bagian ini, anda dapat menambahkan lebih dari satu recipe yang dapat disesuaikan dengan kebutuhan deployment anda.

Ada banyak recipe yang dapat digunakan, misal: codeigniter, cakephp, npm, dll. Untuk daftar recipe yang dapat digunakan, silahkan akses link [berikut](https://deployer.org/docs/7.x/recipe/common).

- **config**

Bagian ini berfungsi untuk membuat "config" yang dapat digunakan pada proses deployment. Secara default, file deploy.yaml akan memiliki satu config yaitu remote url dari git repository.

Format penulisan config yaitu _key-value_. Lalu untuk memanggil config yang kita atur yaitu dengan format:

```yaml
{ { key } }
```

Contoh:

```yaml
config:
  repository: "git@github.com:Buatin-Website/blog-snippet.git"
  deploy_path: "/var/www/"
```

- **hosts**

Bagian ini berfungsi untuk mendefinisikan path untuk kita melakukan deployment. Kita juga dapat menambahkan config yang hanya akan di akses dari host yg kita gunakan.

Contoh:

```yaml
hosts:
  dev:
    remote_user: deployer
    deploy_path: "~/buatin-blog-snippet"
```

Untuk menggunakan config yang sudah kita atur sebelumnya, kita dapat merubah kode diatas menjadi:

```yaml
hosts:
  dev:
    remote_user: deployer
    deploy_path: "{{base_deploy_path}}/buatin-blog-snippet"
```

- **tasks**

**Tasks** merupakan bagian utama dari file deploy.yaml, dimana kita akan mengatur logic dari proses deployment kita, mulai dari proses pull project, melakukan instalasi package, sampai melakukan migrasi database.

Untuk membuat **tasks** yang lebih rapi dan ringkas, kita dapat membuat recipe baru dan melakukan import pada file deploy.yaml.

- **after**

Pada bagian **after**, kita dapat menambahkan proses yang akan dijalankan ketika semua tasks sudah dijalankan.

## Deployer Commands

Setelah kita menulis deploy.yaml, untuk menjalankan tasks yang kita buat sebelumnya cukup dengan menjalankan perintah berikut:

```bash
dep namatask
```

Apabila deploy.yaml hanya memiliki satu host, maka secara otomatis host tersebut yang akan digunakan sebagai target deploymets. Namun apabila terdapat lebih dari satu host, maka anda akan diberikan pilihan host yang akan kita gunakan. Anda juga dapat secara explisit menentukan host yang akan digunakan sebagai target deployment dengan menambahkan nama host pada deploy command.

```bash
dep namatask namahost
```

## Laravel Deploy Task

Sekarang kita bahas task secara spesifik untuk laravel 😄

Saat kita melakukan konfigurasi di awal, **Deployer** sudah membuat deploy.yaml dengan template yang kita pilih. Namun terkadang template yang dibuat masih belum sesuai dengan kebutuhan kita. Oleh sebab itu penulis akan memberikan format deploy.yaml yang sering penulis pakai untuk deploy project ke server.

```yaml
import:
  - recipe/laravel.php
  - contrib/npm.php

config:
  remote_user: buatin_website
  writable_mode: chmod
  repository: "git@github.com:Buatin-Website/blog-snippet.git"

hosts:
  dev:
    hostname: buatin.website
    deploy_path: "~/buatin.website"
    branch: main

tasks:
  deploy:
    - deploy:prepare
    - deploy:vendors
    - artisan:storage:link
    - npm:install
    - npm:run:prod
    - artisan:migrate
    - deploy:publish
  npm:run:prod:
    - run: "cd {{release_path}} && npm run prod"

after:
  deploy:failed: deploy:unlock
```

Penjelasan:

- **remote_user**: user yang digunakan saat melakukan akses ssh
- **writable_mode**: mode penulisan file yg digunakan saat melakukan proses deploy. mode yg tersedia: chown, chgrp, chmod, acl
- **hostname**: host yang digunakan untuk akses ssh
- **deploy_path**: path yang akan digunakan sebagai target deploy
- **branch**: branch yang akan digunakan pada git repository sebagai target deploy
- **deploy:prepare**: membuat folder release baru dan menyiapkan semua yang ada di dalamnya
- **deploy:vendors**: menginstall composer dependency
- **artisan:storage:link**: menjalankan perintah artisan storage:link untuk membuat symlink public disk di laravel
- **npm:install**: menjalankan perintah npm install dari recipe npm
- **npm:run:prod**: menjalankan task **npm:run:prod** yang ada pada deploy.yaml, berfungsi untuk compile asset npm
- **artisan:migrate**: menjalankan perintah artisan migrate untuk menjalankan migration laravel
- **deploy:publish**: memublikasikan release baru dengan menjadikannya release yang sedang aktif

Selanjutnya untuk melakukan deploy, anda cukup menjalankan:

```bash
dep deploy
```

Setelah proses deploy berhasil dijalankan, maka pada deploy path akan ada 3 folder baru:

- **current**: directory hasil dari symlink ke release terbaru
- **releases: directory yang berisi daftar releases yang sudah dibuat**
- **shared**: folder yang akan di "bagi" dengan semua releases yang sudah dibuat. Sehingga semua file yang di upload oleh user di website akan diletakkan di folder ini (tidak lagi di folder storage/app/public)

Kemudian atur root website agar mengarah ke **{{deploy_path}}/current/public.**

Catatan:

Saat pertama kali melakukan proses deploy, anda perlu membuat file **.env** baru karena secara default file tersebut di _ignore_ oleh laravel.

Untuk membuatnya cukup buat file baru di folder shared, dan isi data sesuai dengan pengaturan website anda.

Selain itu, ada hal yang perlu dijadikan perhatian dalam contoh deploy.yaml diatas yaitu mengenai migrasi database. Apabila migrasi database yang dibuat merupakan perubahan major, disarankan untuk menjalankan artisan down dan artisan up saat proses deploy agar tidak terjadi kesalahan data saat proses deploy. Untuk menambahkan artisan up dan artisan down pada task cukup merubah kode menjadi:

```yaml
tasks:
  deploy:
    - ...
    - artisan:down
    - artisan:migrate
    - artisan:up
```

## Kesimpulan

Deployment dengan menerapkan strategi _Zero Downtime Deployment_ merupakan proses yang panjang dan rumit sebab kita perlu menjalankan beberapa tahapan secara tepat. Dengan mengikuti artikel ini, diharapkan proses deployment menjadi lebih mudah untuk diterapkan 😊

## Referensi

- [https://lorisleiva.com/deploy-your-laravel-app-from-scratch/install-and-configure-deployer](https://lorisleiva.com/deploy-your-laravel-app-from-scratch/install-and-configure-deployer)
