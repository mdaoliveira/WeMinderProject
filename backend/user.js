import db from "./db.js";

export const createUser = (username, email, hashedPassword, callback) => {
    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, hashedPassword], callback);
};


export const findByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [email], (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

export const findByEmail2 = (email) => {
    return new Promise((resolve, reject) => {
        const q = "SELECT * FROM users WHERE email = ?";
        db.query(q, [email], (err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
};
