import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "my_jwt_secret";

export const getUserIdFromToken = (req) => {
 

    const token = req.headers.authorization?.split(" ")[1];
  
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.id; // or decoded.userId depending on your payload
};
