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
        return this.data.find((p) => p.id === parseInt(productId));
    }

    addProduct(product) {
        const addingProduct = {
            id: this.createNewId(),
        };

        addingProduct.name = product.name.trim();
        addingProduct.category = product.category.trim().toLowerCase();
        addingProduct.price = Number(product.price);
        addingProduct.img = product.img.trim();

        this.data.push(addingProduct);
        return addingProduct;
    }

    updateProduct(product) {
        const index = this.data.findIndex((p) => p.id === parseInt(product.id));
        if (index === -1) return false;
        this.data[index].name = product.name.trim();
        this.data[index].category = product.category.trim().toLowerCase();
        this.data[index].price = Number(product.price);
        if (product.img) this.data[index].img = product.img.trim();
        return true;
    }

    deleteProduct(productId) {
        const index = this.data.findIndex((p) => p.id === parseInt(productId));
        if (index === -1) return false;
        this.data.splice(index, 1);
        return true;
    }

    createNewId() {
        return this.data.length
            ? Math.max(...this.data.map((p) => p.id)) + 1
            : 1;
    }
}
const manager = new ProductManager(data);

class ValidationError extends Error {};

const getToken = (req) => {
    const auth = req.headers["authorization"];
    if(!auth) return null;

    const [type, token] = auth.split(" ");
    if(type !== "Bearer" || !token) return null;
    return token;
};

const token = 'abd34sd34';

const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(manager.getAll()));
            } else if (req.method === 'POST') {
                if(getToken(req) !== token) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ holat: "Unauthorized.(Token yo'q)"}))
                    return;
                };

                let body = '';

                req.on('data', (chunk) => {
                    body += chunk;
                });

                req.on('end', () => {
                    try {
                        const product = JSON.parse(body);

                        // URL validation
                        if(typeof product.img !== "string" || !/^https:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(product.img.trim())) throw new ValidationError("Rasm manzili noto'g'ri.");
                        // Name validation
                        if(typeof product.name !=="string" || product.name.trim().length === 0) throw new ValidationError("Ism noto'g'ri kiritildi.");
                        if(product.name.trim().length < 2) throw new ValidationError("Ism juda qisqa.");
                        if(product.name.trim().length > 100) throw new ValidationError("Ism juda uzun.");
                        // Price validation

                        if(!Number.isFinite(product.price) || Number(product.price) < 1 || Number(product.price) > 20000) throw new ValidationError("Narx noto'g'ri.");
                        // Category validation
                        if(typeof product.category !=="string" || product.category.trim().length === 0) throw new ValidationError("Category noto'g'ri kiritildi.");
                        if(product.category.trim().length < 2) throw new ValidationError("Category juda qisqa.");
                        if(product.category.trim().length > 20) throw new ValidationError("Category juda uzun.");
                        if(!/^[a-zA-Z]{3,20}$/.test(product.category.trim())) throw new ValidationError("Category noto'g'ri kiritildi.");

                        const added = manager.addProduct(product);
                        
                        console.log("Qo'shildi: ", added);
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end( JSON.stringify({...added, holat: "yangi mahsulot qo'shildi",}));
                    }catch (err) {
                        console.log(err.message);
                        
                        let status, holat;

                        if(err instanceof SyntaxError){
                           status = 400;
                           holat = "noto'g'ri JSON";
                        } else if (err instanceof ValidationError){
                           status = 400;
                           holat = err.message;
                        } else {
                           status = 500;
                           holat = "Server xatosi";
                        }

                        res.writeHead(status, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ holat: holat }));
                    }
                });
            } else if (req.method === 'PUT') {
                if(getToken(req) !== token) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ holat: "Unauthorized.(Token yo'q)"}))
                    return;
                };

                const productId = req.url.split('/')[2];

                let body = '';

                req.on('data', (chunk) => {
                    body += chunk;
                });

                req.on('end', () => {
                    try {
                        const product = JSON.parse(body);
                        product.id = productId;

                        // URL validation
                        if(product.img !== undefined && product.img !== ''){
                            if(typeof product.img !== "string" || !/^https:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(product.img.trim())) throw new ValidationError("Rasm manzili noto'g'ri.");
                        };
                        // Name validation
                        if(typeof product.name !=="string" || product.name.trim().length === 0) throw new ValidationError("Ism noto'g'ri kiritildi.");
                        if(product.name.trim().length < 2) throw new ValidationError("Ism juda qisqa.");
                        if(product.name.trim().length > 100) throw new ValidationError("Ism juda uzun.");
                        // Price validation
                        if(!Number.isFinite(product.price) || Number(product.price) < 1 || Number(product.price) > 20000) throw new ValidationError("Narx noto'g'ri.");
                        // Category validation
                        if(typeof product.category !=="string" || product.category.trim().length === 0) throw new ValidationError("Category noto'g'ri kiritildi.");
                        if(product.category.trim().length < 2) throw new ValidationError("Category juda qisqa.");
                        if(product.category.trim().length > 20) throw new ValidationError("Category juda uzun.");
                        if(!/^[a-zA-Z]{3,20}$/.test(product.category.trim())) throw new ValidationError("Category noto'g'ri kiritildi.");

                        if(manager.updateProduct(product)){
                            console.log("Yangilandi: ", manager.getById(productId));
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(
                                JSON.stringify({
                                    ...manager.getById(productId),
                                    holat: 'mahsulot yangilandi',
                                })
                            );
                        }else {
                             res.writeHead(404, { 'Content-Type': 'application/json' });
                             res.end(JSON.stringify({ holat: "Mahsulot topilmadi." }));
                        }

                    }catch (err) {
                         console.log(err.message);
                         
                         let status, holat;

                         if(err instanceof SyntaxError){
                            status = 400;
                            holat = "noto'g'ri JSON";
                         } else if (err instanceof ValidationError){
                            status = 400;
                            holat = err.message;
                         } else {
                            status = 500;
                            holat = "Server xatosi";
                         }

                         res.writeHead(status, { 'Content-Type': 'application/json' });
                         res.end(JSON.stringify({ holat: holat }));
                    }
                });
            } else if (req.method === 'DELETE') {
                if(getToken(req) !== token) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ holat: "Unauthorized.(Token yo'q)"}))
                    return;
                };

                const productId = req.url.split('/')[2];
                const product = manager.getById(productId);
                
                if(manager.deleteProduct(productId)) {
                    console.log("O'chirildi: ", product);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ holat: "mahsulot o'chirildi" }));
                }else{
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ holat: "mahsulot topilmadi." }));
                }

            } else{
                res.writeHead(405, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ holat: "Noto'g'ri method." }));
            }
        } else if (req.url.startsWith('/login') && req.method === 'POST') {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                try {
                    const { login, password } = JSON.parse(body);

                    if (login === 'admin' && password === 'admin123') {
                        console.log("Yangi login (admin).");
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(
                            JSON.stringify({
                                holat: 'muvaffaqiyatli login',
                                token: token,
                            })
                        );
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(
                            JSON.stringify({
                                holat: "Login yoki parol noto'g'ri",
                            })
                        );
                    }
                } catch (err) {
                    console.log(err.message);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({holat: "noto'g'ri JSON"}))
                }
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ holat: "Noto'g'ri URL" }));
        }
    } catch (err) {
        console.log('Xatolik:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({holat: "server xatosi"}));
    }
});

server.listen(3300, () => {
    console.log('Server 3300-portda ishlayapti.');
});
