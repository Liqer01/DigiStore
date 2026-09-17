const fs = require('fs');
const path = require('path');

class JSONDatabase {
  constructor(filepath) {
    this.filepath = filepath || path.join(__dirname, 'database.json');
    this.data = {
      users: [],
      products: [],
      orders: [],
      order_items: [],
      licenses: [],
      invoices: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filepath)) {
        const raw = fs.readFileSync(this.filepath, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch(e) {
      console.warn('Database load warning:', e.message);
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filepath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch(e) {
      console.error('Database save error:', e.message);
    }
  }

  exec(sql) {
    ['users', 'products', 'orders', 'order_items', 'licenses', 'invoices'].forEach(t => {
      if (!this.data[t]) this.data[t] = [];
    });
    this.save();
  }

  prepare(sql) {
    const trimmed = sql.trim();
    const self = this;

    return {
      get(...params) {
        const results = self.executeQuery(trimmed, params);
        return results.length ? results[0] : null;
      },
      all(...params) {
        return self.executeQuery(trimmed, params);
      },
      run(...params) {
        return self.executeMutation(trimmed, params);
      }
    };
  }

  executeQuery(sql, params = []) {
    const s = sql.replace(/\s+/g, ' ').trim();
    
    // 1. SELECT COUNT(*) as c FROM products
    if (/SELECT COUNT\(\*\)\s+as\s+c\s+FROM\s+products/i.test(s)) {
      return [{ c: this.data.products.length }];
    }

    // 2. SELECT id FROM users WHERE role='admin'
    if (/SELECT id FROM users WHERE role='admin'/i.test(s)) {
      const u = this.data.users.find(x => x.role === 'admin');
      return u ? [{ id: u.id }] : [];
    }

    // 3. SELECT id FROM users WHERE email=?
    if (/SELECT id FROM users WHERE email=\?/i.test(s)) {
      const email = String(params[0] || '').toLowerCase().trim();
      const u = this.data.users.find(x => (x.email || '').toLowerCase().trim() === email);
      return u ? [{ id: u.id }] : [];
    }

    // 4. SELECT * FROM users WHERE email=?
    if (/SELECT \* FROM users WHERE email=\?/i.test(s)) {
      const email = String(params[0] || '').toLowerCase().trim();
      const u = this.data.users.find(x => (x.email || '').toLowerCase().trim() === email);
      return u ? [u] : [];
    }

    // 5. SELECT id, email, name, role, created_at FROM users WHERE id=?
    if (/SELECT .* FROM users WHERE id=\?/i.test(s)) {
      const id = String(params[0] || '');
      const u = this.data.users.find(x => String(x.id) === id);
      return u ? [u] : [];
    }

    // 6. SELECT * FROM products WHERE is_active=1
    if (/SELECT \* FROM products WHERE is_active=1/i.test(s)) {
      let list = this.data.products.filter(p => p.is_active !== 0 && p.is_active !== false);
      if (/AND category=\?/i.test(s)) {
        const cat = params[0];
        if (cat && cat !== 'all') list = list.filter(p => p.category === cat);
      }
      if (/ORDER BY price ASC/i.test(s)) {
        list.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (/ORDER BY price DESC/i.test(s)) {
        list.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else {
        list.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
      }
      return list;
    }

    // 7. SELECT * FROM products WHERE id=?
    if (/SELECT \* FROM products WHERE id=\?/i.test(s)) {
      const id = String(params[0] || '');
      const p = this.data.products.find(x => String(x.id) === id);
      return p ? [p] : [];
    }

    // 8. SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC
    if (/SELECT \* FROM orders WHERE user_id=\?/i.test(s)) {
      const uid = String(params[0] || '');
      const ords = this.data.orders.filter(o => String(o.user_id) === uid);
      ords.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      return ords;
    }

    // 9. SELECT * FROM orders WHERE id=?
    if (/SELECT \* FROM orders WHERE id=\?/i.test(s)) {
      const id = String(params[0] || '');
      const ord = this.data.orders.find(o => String(o.id) === id);
      return ord ? [ord] : [];
    }

    // 10. SELECT * FROM order_items WHERE order_id=?
    if (/SELECT \* FROM order_items WHERE order_id=\?/i.test(s)) {
      const oid = String(params[0] || '');
      return this.data.order_items.filter(i => String(i.order_id) === oid);
    }

    // 11. SELECT * FROM licenses WHERE order_id=?
    if (/SELECT \* FROM licenses WHERE order_id=\?/i.test(s)) {
      const oid = String(params[0] || '');
      return this.data.licenses.filter(l => String(l.order_id) === oid);
    }

    // 12. SELECT * FROM licenses WHERE license_key=?
    if (/SELECT \* FROM licenses WHERE license_key=\?/i.test(s)) {
      const key = String(params[0] || '').trim();
      const l = this.data.licenses.find(x => x.license_key === key);
      return l ? [l] : [];
    }

    // 13. Admin stats & lists
    if (/SELECT SUM\(total\) as total FROM orders WHERE status='completed'/i.test(s)) {
      const total = this.data.orders.filter(o => o.status === 'completed').reduce((sum, x) => sum + (Number(x.total) || 0), 0);
      return [{ total }];
    }
    if (/SELECT COUNT\(\*\) as count FROM orders WHERE status='completed'/i.test(s)) {
      return [{ count: this.data.orders.filter(o => o.status === 'completed').length }];
    }
    if (/SELECT COUNT\(\*\) as count FROM orders WHERE status='pending'/i.test(s)) {
      return [{ count: this.data.orders.filter(o => o.status === 'pending').length }];
    }
    if (/SELECT COUNT\(\*\) as count FROM users WHERE role='customer'/i.test(s)) {
      return [{ count: this.data.users.filter(u => u.role !== 'admin').length }];
    }
    if (/SELECT \* FROM orders ORDER BY created_at DESC/i.test(s)) {
      const ords = [...this.data.orders];
      ords.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      if (/LIMIT 10/i.test(s)) return ords.slice(0, 10);
      return ords;
    }
    if (/SELECT \* FROM products ORDER BY sales_count DESC LIMIT 5/i.test(s)) {
      const prods = [...this.data.products];
      prods.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
      return prods.slice(0, 5);
    }
    if (/SELECT id,email,name,role,created_at,last_login FROM users/i.test(s)) {
      return this.data.users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, created_at: u.created_at, last_login: u.last_login }));
    }

    return [];
  }

  executeMutation(sql, params = []) {
    const s = sql.replace(/\s+/g, ' ').trim();

    // INSERT INTO users
    if (/INSERT INTO users/i.test(s)) {
      const user = {
        id: params[0],
        email: params[1],
        password: params[2],
        name: params[3] || '',
        role: params[4] || 'customer',
        created_at: new Date().toISOString(),
        last_login: null
      };
      this.data.users.push(user);
      this.save();
      return { changes: 1 };
    }

    // UPDATE users SET last_login=datetime('now') WHERE id=?
    if (/UPDATE users SET last_login/i.test(s)) {
      const id = String(params[0] || '');
      const u = this.data.users.find(x => String(x.id) === id);
      if (u) u.last_login = new Date().toISOString();
      this.save();
      return { changes: u ? 1 : 0 };
    }

    // INSERT INTO products
    if (/INSERT INTO products/i.test(s)) {
      const p = {
        id: params[0],
        name: params[1],
        description: params[2],
        price: Number(params[3]) || 0,
        old_price: params[4] ? Number(params[4]) : null,
        category: params[5],
        emoji: params[6] || '',
        sales_count: params[7] !== undefined ? Number(params[7]) : 0,
        is_active: 1,
        created_at: new Date().toISOString()
      };
      this.data.products.push(p);
      this.save();
      return { changes: 1 };
    }

    // UPDATE products
    if (/UPDATE products SET name=/i.test(s)) {
      const id = String(params[params.length - 1]);
      const p = this.data.products.find(x => String(x.id) === id);
      if (p) {
        p.name = params[0];
        p.description = params[1];
        p.price = Number(params[2]);
        p.old_price = params[3] ? Number(params[3]) : null;
        p.category = params[4];
        p.emoji = params[5];
        p.is_active = params[6] ?? 1;
      }
      this.save();
      return { changes: p ? 1 : 0 };
    }

    if (/UPDATE products SET is_active=0 WHERE id=\?/i.test(s)) {
      const id = String(params[0] || '');
      const p = this.data.products.find(x => String(x.id) === id);
      if (p) p.is_active = 0;
      this.save();
      return { changes: p ? 1 : 0 };
    }

    if (/UPDATE products SET sales_count=sales_count\+1 WHERE id=\?/i.test(s)) {
      const id = String(params[0] || '');
      const p = this.data.products.find(x => String(x.id) === id);
      if (p) p.sales_count = (p.sales_count || 0) + 1;
      this.save();
      return { changes: p ? 1 : 0 };
    }

    // INSERT INTO orders
    if (/INSERT INTO orders/i.test(s)) {
      const ord = {
        id: params[0],
        user_id: params[1],
        user_email: params[2],
        user_name: params[3],
        subtotal: Number(params[4]) || 0,
        tax: Number(params[5]) || 0,
        total: Number(params[6]) || 0,
        status: 'pending',
        invoice_no: params[7],
        created_at: new Date().toISOString(),
        completed_at: null
      };
      this.data.orders.push(ord);
      this.save();
      return { changes: 1 };
    }

    // UPDATE orders SET status='completed'
    if (/UPDATE orders SET status='completed'/i.test(s)) {
      const id = String(params[params.length - 1] || '');
      const ord = this.data.orders.find(x => String(x.id) === id);
      if (ord) {
        ord.status = 'completed';
        ord.completed_at = new Date().toISOString();
        if (params.length > 1) ord.payment_id = params[0];
      }
      this.save();
      return { changes: ord ? 1 : 0 };
    }

    if (/UPDATE orders SET status=\? WHERE id=\?/i.test(s)) {
      const status = params[0];
      const id = String(params[1] || '');
      const ord = this.data.orders.find(x => String(x.id) === id);
      if (ord) ord.status = status;
      this.save();
      return { changes: ord ? 1 : 0 };
    }

    // INSERT INTO order_items
    if (/INSERT INTO order_items/i.test(s)) {
      const it = {
        id: params[0],
        order_id: params[1],
        product_id: params[2],
        product_name: params[3],
        price: Number(params[4]) || 0
      };
      this.data.order_items.push(it);
      this.save();
      return { changes: 1 };
    }

    // INSERT INTO licenses
    if (/INSERT INTO licenses/i.test(s)) {
      const lic = {
        id: params[0],
        order_id: params[1],
        product_id: params[2],
        user_email: params[3],
        license_key: params[4],
        download_count: 0,
        max_downloads: 5,
        is_active: 1,
        created_at: new Date().toISOString()
      };
      this.data.licenses.push(lic);
      this.save();
      return { changes: 1 };
    }

    // INSERT INTO invoices
    if (/INSERT INTO invoices/i.test(s)) {
      const inv = {
        id: params[0],
        order_id: params[1],
        invoice_no: params[2],
        user_email: params[3],
        user_name: params[4],
        amount: Number(params[5]) || 0,
        tax: Number(params[6]) || 0,
        total: Number(params[7]) || 0,
        created_at: new Date().toISOString()
      };
      this.data.invoices.push(inv);
      this.save();
      return { changes: 1 };
    }

    return { changes: 0 };
  }
}

module.exports = JSONDatabase;
