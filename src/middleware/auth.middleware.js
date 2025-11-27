import jwt from "jsonwebtoken";
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET || "my_jwt_secret";

export const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.log('there is no token here')
        return res.status(401).json({ msg: "No token provided" })};

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded user:", decoded); 

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Invalid token" });
  }
};
