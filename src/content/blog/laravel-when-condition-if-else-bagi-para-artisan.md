---
title: Laravel "When" Condition, If-Else Bagi Para Artisan
description: Pengkondisian dalam Laravel menggunakan "when", alternatif if-else bagi para artisan
author: Andreas Asatera
pubDatetime: 2023-04-15T00:00:00+07:00
postSlug: laravel-when-condition-if-else-bagi-para-artisan
featured: false
draft: false
tags:
  - laravel
canonicalURL: https://blog.buatin.website/laravel-when-condition-if-else-bagi-para-artisan
---

Dalam pembuatan website, seringkali kita membutuhkan query khusus berdasarkan dengan kondisi yang diberikan.

Sebagai contoh, berikut query untuk mendapatkan data karyawan beserta departemennya, kemudian diberikan pengkondisian berdasarkan _input_ nama karyawan dan/atau ID dari departemen:

```php
public function index(Request $request) {
    $employees = Employee::query();
    $employees->with(['department']);
    if ($request->filled('name')) {
        $employees->where('name', 'like', '%'.$request->name.'%');
    }
    if ($request->filled('department_id')) {
        $employees->where('department_id', $request->department_id);
    }

   return view('employee.index', [
       'employees' => $employees->get(),
   ]);
}
```

Terlihat sederhana dan mudah dipahami bukan?

Mari kita tambahkan pengkondisian dimana ketika **department_id** tidak di isi, maka data karyawan yang tampil hanya karyawan yang belum masuk kedalam departemen manapun.

```php
public function index(Request $request) {
    $employees = Employee::query();
    $employees->with(['department']);
    if ($request->filled('name')) {
        $employees->where('name', 'like', '%'.$request->name.'%');
    }
    if ($request->filled('department_id')) {
        $employees->where('department_id', $request->department_id);
    } else {
        $employees->where('department_id', null);
    }

    return view('employee.index', [
        'employees' => $employees->get(),
    ]);
}
```

Terlihat mulai tidak "rapi" bukan?

Mengatasi hal tersebut, Laravel sebagai framework bagi para Artisan memiliki sebuah _eloquent_ _method,_ yaitu _eloquent_ **When** _method_.

### Eloquent When

Penggunaan _eloquent_ **When** sangatlah mudah, kita hanya perlu memanggil method **When** dengan memberikan parameter sebagai berikut:

- Parameter #1: Pengkondisian yang akan digunakan
- Parameter #2: Query yang akan dijalankan apabila kondisi terpenuhi
- Parameter #3: Query yang akan dijalankan apabila kondisi tidak terpenuhi (optional)

Dari penjelasan diatas, maka code diatas apabila kita rubah menggunakan _eloquent_ **When** maka akan berubah menjadi seperti ini:

```php
public function index(Request $request) {
    $employees = Employee::query();
    $employees->with(['department']);
    $employees->when($request->filled('name'), function ($query) use ($request) {
        $query->where('name', 'like', '%'.$request->name.'%');
    });
    $employees->when($request->filled('department_id'), _function_ ($query) use ($request) {
        $query->where('department_id', $request->department_id);
    }, function ($query) {
        $query->where('department_id', null);
    });

    return view('employee.index', [
        'employees' => $employees->get(),
    ]);
}
```

Lebih mudah dibaca dan lebih **_Laravel_** bukan? 😄

**Bonus**:

Apabila anda ingin meringkas jumlah baris code dari query diatas, anda bisa juga menggunakan **Arrow Function** yang mulai diperkenalkan pada PHP versi 7.4 ke atas.

Berikut code yang telah dirubah menggunakan **Arrow Function**:

```php
public function index(Request $request) {
    $employees = Employee::query();
    $employees->with(['department']);
    $employees->when($request->filled('name'), fn($query) => $query->where('name', 'like', '%'.$request->name.'%'));
    $employees->when($request->filled('department_id'), fn($query) => $query->where('department_id', $request->department_id), fn($query) => $query->where('department_id', null));

    return view('employee.index', [
        'employees' => $employees->get(),
    ]);
}
```
