import { body } from "express-validator";

const userValidationRules = [
  body("username")
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters long"),

  body("email")
    .isEmail()
    .withMessage("Enter a valid email"),

  body("password")
    .isLength({ min: 5 })
    .withMessage("Password must be at least 5 characters long"),
];

export default userValidationRules;
