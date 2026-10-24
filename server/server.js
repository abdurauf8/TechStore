import { createServer } from 'node:http';
import fs, { readFile } from 'node:fs';
import path from 'node:path';
import data from './data.js';
import Busboy from 'busboy';
import crypto from 'node:crypto';

const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    ///////////////////////////////
    try {
        if (req.url.startsWith('/products')) {
            console.log("'/products' ga so'rov keldi.");

            if (req.method === 'GET') {
                res.writeHead(200);
                res.end(JSON.stringify(data));
            } else if (req.method === 'POST') {
                const busboy = Busboy({ headers: req.headers });
                const uploadPromises = [];
                const fields = {};

                let imagePath = '';

                busboy.on('field', (name, value) => {
                    fields[name] = value;
                });

                busboy.on('file', (name, file, info) => {
                    // Faqat img maydonidagi faylni qabul qilamiz
                    if (name !== 'img') {
                        file.resume();
                        return;
                    }

                    // Fayl turini tekshirish
                    const allowedTypes = [
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                    ];

                    if (!allowedTypes.includes(info.mimeType)) {
                        file.resume();
                        return;
                    }

                    // Noyob fayl nomi va saqlash manzili
                    const ext = path.extname(info.filename).toLowerCase();
                    const filename = crypto.randomUUID() + ext;
                    const savePath = path.join(import.meta.dirname, 'img', filename);

                    imagePath = `/img/${filename}`;

                    const writeStream = fs.createWriteStream(savePath);

                    file.pipe(writeStream);

                    uploadPromises.push(
                        new Promise((resolve, reject) => {
                            writeStream.on('finish', resolve);
                            writeStream.on('error', reject);
                            file.on('error', reject);
                        })
                    );
                });

                busboy.on('close', async () => {
                    try {
                        await Promise.all(uploadPromises);

                        const product = {
                            id: data.length
                                ? Math.max(...data.map((p) => p.id)) + 1
                                : 1,
                            name: fields.name,
                            price: Number(fields.price),
                            category: fields.category,
                            img: imagePath,
                        };

                        data.push(product);

                        res.writeHead(201, {
                            'Content-Type': 'application/json',
                        });

                        res.end(JSON.stringify(product));
                    } catch (error) {
                        console.error('Mahsulotni saqlashda xatolik:', error);

                        res.writeHead(500, {
                            'Content-Type': 'application/json',
                        });

                        res.end(
                            JSON.stringify({
                                message:
                                    'Mahsulotni saqlashda xatolik yuz berdi',
                            })
                        );
                    }
                });

                req.pipe(busboy);
            } else if (req.method === 'PUT') {
                const productId = req.url.split('/')[2];
                const editingProduct = data.find(
                    (p) => p.id === parseInt(productId)
                );

                if (!editingProduct) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ message: 'Mahsulot topilmadi' }));
                    return;
                }

                const busboy = Busboy({ headers: req.headers });
                const uploadPromises = [];
                const fields = {};

                let imagePath = '';

                busboy.on('field', (name, value) => {
                    fields[name] = value;
                });

                busboy.on('file', (name, file, info) => {
                    if (name !== 'img') {
                        file.resume();
                        return;
                    }

                    const allowedTypes = [
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                    ];

                    if (!allowedTypes.includes(info.mimeType)) {
                        file.resume();
                        return;
                    }

                    const ext = path.extname(info.filename).toLowerCase();
                    const filename = crypto.randomUUID() + ext;
                    const savePath = path.join(import.meta.dirname, 'img', filename);

                    imagePath = `/img/${filename}`;

                    const writeStream = fs.createWriteStream(savePath);
                    file.pipe(writeStream);

                    uploadPromises.push(
                        new Promise((resolve, reject) => {
                            writeStream.on('finish', resolve);
                            writeStream.on('error', reject);
                            file.on('error', reject);
                        })
                    );
                });

                busboy.on('close', async () => {
                    try {
                        await Promise.all(uploadPromises);

                        editingProduct.name = fields.name;
                        editingProduct.category = fields.category;
                        editingProduct.price = Number(fields.price);

                        if (imagePath) {
                            editingProduct.img = imagePath;
                        }

                        res.writeHead(200, {
                            'Content-Type': 'application/json',
                        });

                        res.end(JSON.stringify(editingProduct));
                    } catch (error) {
                        console.error('Mahsulotni yangilashda xatolik:', error);

                        res.writeHead(500, {
                            'Content-Type': 'application/json',
                        });

                        res.end(
                            JSON.stringify({
                                message: 'Mahsulotni yangilashda xatolik',
                            })
                        );
                    }
                });

                req.pipe(busboy);
            } else if (req.method === "DELETE") {
                const productId = req.url.split('/')[2];
                const product = data.find(p => p.id === parseInt(productId));
                if(!product){
                    res.writeHead(404);
                    res.end(JSON.stringify({ holat: "mahsulot topilmadi" }));
                }
                const index = data.findIndex(p => p.id === parseInt(productId));
                if(index !== -1){
                    data.splice(index, 1);
                }
                
                res.writeHead(204);
                res.end(JSON.stringify({holat: "mahsulot o'chirildi"}));
            }

        } else if (req.url.startsWith('/img')) {
            const imageName = path.basename(req.url);
            const imagePath = path.join(
                import.meta.dirname,
                'img',
                imageName
            );

            readFile(imagePath, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('Rasm topilmadi');
                    return;
                }

                res.writeHead(200, {
                    'Content-Type': 'image/png',
                });

                res.end(data);
            });

            return;
        }else if(req.url.startsWith("/login")) {
            if(req.method === "POST"){
                let token = "abd34sd34";
                let body ="";

                req.on("data", (chunk) => {
                    body += chunk; 
                })
                req.on("end", () => {
                    const { login, password } = JSON.parse(body);
                    console.log(login, password);
                    
                    if(login === "admin" && password === "admin123"){
                        res.writeHead(200);
                        res.end(JSON.stringify({holat: "muvaffaqiyatli", token: token}));
                    }else {
                        res.writeHead(401);
                        res.end(JSON.stringify({holat: "kiritilgan ma'lumot noto'g'ri"}));
                    }
                })
            }

        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ holat: "Noto'g'ri URL" }));
        }
    } catch (err) {
        console.log('Xatolik:', err.message);
    }
});

server.listen(3300, () => {
    console.log('Server 3300-portda ishlayapti.');
});
