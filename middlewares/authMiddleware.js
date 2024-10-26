const jwt = require("jsonwebtoken");

const { secretKey } = require("./config");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token1 = authHeader && authHeader.split(" ")[1];
  //console.log(token1,'hubcyvbuhs')

  if (!token1) {
    return res.status(401).json({ message: "Access denied" });
  }

  jwt.verify(token1, secretKey, (err, decoded) => {
    if (err) {
      //console.log(err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.userId = decoded.id;
    next();
  });
};

module.exports = { authenticateToken, secretKey };
