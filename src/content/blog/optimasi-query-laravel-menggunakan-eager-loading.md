---
title: Optimasi Query Laravel Menggunakan Eager Loading
author: Andreas Asatera
pubDatetime: 2023-03-04T00:00:00+07:00
postSlug: optimasi-query-laravel-menggunakan-eager-loading
featured: false
draft: false
tags:
  - laravel
description: Meningkatkan performa laravel dengan mengoptimalkan query menggunakan eager loading
canonicalURL: https://blog.buatin.website/optimasi-query-laravel-menggunakan-eager-loading
---

Penggunaan _framework_ Laravel dalam pembuatan _website_ sangat membantu _developer_ untuk dapat membuat _website_ dengan mudah dan cepat.

Seiring berkembangnya proses bisnis, terkadang _website_ menjadi semakin kompleks karena adanya data yang saling berkaitan antar satu data dengan data yang lain. Tentu saja Laravel sudah memiliki fitur untuk mempermudah kasus tersebut dengan menggunakan fitur **_Eloquent_** **_Relationship_**.

Namun penggunaan **_Eloquent Relationship_** yang tidak sesuai dapat menimbulkan permasalahan "N+1 query" yang menyebabkan website menjadi lebih berat ketika di akses.

### Apa itu N+1 query?

N+1 query yaitu merupakan suatu permasalahan yang dapat terjadi ketika melakukan query pemanggilan data "parent" beserta pemanggilan data relasi "children" dari parent tersebut. Yang dimaksud dengan N+1 di sini yaitu kita melakukan 1 query untuk memanggil data parent, kemudian query sebanyak N, dimana N yaitu sejumlah data parent yang dipanggil.

Untuk memahami lebih lanjut, mari kita buat skenario sebagai berikut:

Perusahaan A memiliki 3 divisi, yaitu: **Frontend**, **Backend**, **UX/UI**.

Kemudian untuk daftar karyawan sebagai berikut:

[![](https://buatin.website/storage/uFrdKafjgbjROv73vo061eY4xVU3pW9MHlMMomSu.png)](https://buatin.website/storage/uFrdKafjgbjROv73vo061eY4xVU3pW9MHlMMomSu.png)

Daftar Karyawan

Sehingga struktur database yang bisa kita buat seperti ini:

[![](https://buatin.website/storage/7DbDk9zkkyRHiQu0tBwVsf2LZcG4mbduWJmXJlGx.png)](https://buatin.website/storage/7DbDk9zkkyRHiQu0tBwVsf2LZcG4mbduWJmXJlGx.png)

Struktur Database

Lalu untuk memanggil data, kita buat model, controller, dan view sebagai berikut:

- Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'department_id'];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
}
```

- Controller

```php
<?php

namespace App\Http\Controllers;

use App\Models\Employee;

class EmployeeController extends Controller
{
    public function index()
    {
        return view('employee.index', [
            'employees' => Employee::all(),
        ]);
    }
}
```

- View

```blade
<table>
    <thead>
    <tr>
        <th>#</th>
        <th>Name</th>
        <th>Department</th>
    </tr>
    </thead>
    <tbody>
    @foreach($employees as $employee)
        <tr>
            <td>{{ $loop->iteration }}</td>
            <td>{{ $employee->name }}</td>
            <td>{{ $employee->department->name }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
```

Dari file diatas, maka didapat hasil data sebagai berikut:

[![](https://buatin.website/storage/7IwMmqsD8EdBE7XD0mc6vbgS3GqWQnuwh2A30zcx.png)](https://buatin.website/storage/7IwMmqsD8EdBE7XD0mc6vbgS3GqWQnuwh2A30zcx.png)

Tampilan Daftar Karyawan

Tujuan untuk menampilkan data karyawan beserta divisi memang sudah terpenuhi, namun apakah sudah efisien?

Disini penulis akan melakukan _debug_ menggunakan package Laravel Debugbar untuk melihat query yang dijalankan ketika mengakses halaman tersebut.

[![](https://buatin.website/storage/ESqXyiMN0gV37BuvtorZbxdtEJvoAcWzLVL9X0YO.png)](https://buatin.website/storage/ESqXyiMN0gV37BuvtorZbxdtEJvoAcWzLVL9X0YO.png)

Hasil debug menggunakan Laravel Debugbar

Dapat kita lihat, terdapat 1 query untuk mendapatkan daftar karyawan (_select \* from `employees`_), lalu terdapat banyak query yang dijalankan untuk mendapatkan data divisi dari karyawan yang bersangkutan.

Inilah yang disebut permasalahan N+1 query, sistem akan melakukan 1 query untuk mendapatkan data parent, dan di setiap looping data akan melakukan query untuk mendapatkan data relasi. Pada kasus di atas, sistem melakukan 1 query data parent, dan melakukan 50 query data relasi (angka 50 didapatkan dari jumlah data karyawan)

Secara tampilan, memang data yang diberikan sudah sesuai, namun secara performa, hal tersebut akan menyebabkan penurunan performa dikarenakan pada setiap looping data, sistem akan menjalankan query untuk memanggil data relasi dari data yang bersangkutan.

Lalu bagaimana solusinya? Disini penulis akan menggunakan fitur **Eager Loading**.

### Apa itu Eager Loading?

Sebelum membahas Eager Loading, kita perlu memahami dulu konsep pemanggilan relasi pada Laravel.

Terdapat 2 cara pemanggilan relasi pada Laravel, yaitu **Lazy Loading** dan **Eager Loading**.

Secara default, Laravel tidak akan memanggil relasi kecuali relasi di akses langsung dari sistem. Pada kasus di atas, relasi dipanggil langsung pada saat melakukan _looping_ data:

```blade
@foreach($employees as $employee)
    <tr>
        <td>{{ $loop->iteration }}</td>
        <td>{{ $employee->name }}</td>
        <td>{{ $employee->department->name }}</td>
    </tr>
@endforeach
```

Oleh sebab itu, terjadi permasalahan N+1 query karena pada setiap melakukan looping, sistem akan melakukan query baru untuk mendapatkan data relasi.

Namun pada sistem pemanggilan relasi menggunakan Eager Loading, sistem akan melakukan query bersamaan pada saat dijalankannya query untuk memanggil data parent.

Untuk merubah dari sistem lazy loading ke eager loading, kita hanya perlu melakukan perubahan pada kode disaat kita melakukan query data parent.

Perubahan yang dilakukan yaitu merubah code dari:

```php
Employee::all()
```

menjadi:

```php
Employee::with(['department'])->get()
```

Sehingga method pada controller menjadi:

```php
public function index()
{
    return view('employee.index', [
        'employees' => Employee::with(['department'])->get(),
    ]);
}
```

Hasil debug dari perubahan code diatas:

[![](https://buatin.website/storage/XE6cYGR1VJG2nhP12tV93vgkAtchC8rlxIhnGqJY.png)](https://buatin.website/storage/XE6cYGR1VJG2nhP12tV93vgkAtchC8rlxIhnGqJY.png)

Hasil debug menggunakan Laravel Debugbar

Bisa dilihat perbedaannya dari jumlah query saat menggunakan Lazy Load yaitu sejumlah 51 query, kemudian setelah menggunakan Eager Load turun menjadi sejumlah 2 query saja. Selain itu jumlah waktu yang dibutuhkan untuk _execute query_ turun dari 34.25ms menjadi hanya 5.54ms.

> Dalam contoh kasus diatas, data yang digunakan penulis hanya data sejumlah 50 karyawan dengan relasi ke data department. Hasil _debug_ diatas tentu bisa lebih besar atau lebih kecil, sesuai dengan tingkat kompleksitas dan spesifikasi hardware yang digunakan.

### Kesimpulan

Kemudahan pembuatan website menggunakan framework Laravel memang sangat memanjakan developer. Namun juga perlu dipahami, bahwa kemudahan yang ditawarkan juga memiliki beberapa hal yang perlu diperhatikan, diantaranya yaitu bagaimana membuat website dengan tepat dan efisien sehingga dapat memberikan kenyamanan kepada user dalam menggunakan aplikasi.

Semoga dengan artikel ini dapat memberikan gambaran kepada pembaca tentang bagaimana meningkatkan performa website dengan melakukan **Optimasi Query Laravel Menggunakan Eager Loading**.
