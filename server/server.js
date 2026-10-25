import { createServer } from 'node:http';
import data from './data.js';

class ProductManager {
    constructor(data) {
        this.data = data;
    }

    getAll() {
        return this.data;
    }

    getById(productId) {
        return this.data.find((p) => p.id === Number(productId));
    }

    addProduct(product){
        this.data.push(product);
    }

    updateProduct(prId, newName, newCategory, newPrice, newImgAddress = null){
        const index = this.data.findIndex(p => p.id === prId);
        if(index === -1) return false;
        this.data[index].name = newName;
        this.data[index].category = newCategory;
        this.data[index].price = newPrice;
        if(newImgAddress) this.data[index].img = newImgAddress;
    }

    deleteProduct(productId) {
        const index = this.data.findIndex((p) => p.id === parseInt(productId));
        if (index !== -1) {
            this.data.splice(index, 1);
        }
    }

    createNewId(){
        return this.data.length ? Math.max(...this.data.map((p) => p.id)) + 1 : 1;
    }
}

const manager = new ProductManager(data);

const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, token');
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
                res.end(JSON.stringify(manager.getAll()));
            } else if (req.method === 'POST') {
                let body = "";

                req.on("data", (chunk) => {
                    body += chunk;
                });

                req.on("end", () => {
                    const product = JSON.parse(body);

                    product.id = manager.createNewId();
                    manager.addProduct(product);

                    res.writeHead(201);
                    res.end(JSON.stringify({...product, holat: "yangi mahsulot qo'shildi"}));
                });
                
            } else if (req.method === 'PUT') {
                console.log("put sorovi keldi");
                
            } else if (req.method === "DELETE") {
                const productId = req.url.split('/')[2];
                const product = manager.getById(productId);
                if(!product){
                    res.writeHead(404);
                    res.end(JSON.stringify({ holat: "mahsulot topilmadi" }));
                    return;
                }
                manager.deleteProduct(productId);
                
                res.writeHead(200);
                res.end(JSON.stringify({holat: "mahsulot o'chirildi"}));
            }

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
