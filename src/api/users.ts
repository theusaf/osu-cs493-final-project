import { Router } from "express";
const router = Router();
const express = require('express');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs');

const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'student'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password456',
      role: 'teacher'
    }
  ];

// POST /users
router.post('/', async (req, res) => {
  // TODO: Implement logic to create a new User
  // - Validate the request body
  // - Check if the authenticated User has 'admin' role for creating 'admin' or 'instructor' roles
  // - Create and store the new User in the database
  // - Return the ID of the newly created User with a 201 status code
  // - Return appropriate error responses if needed
  try {
    const { name, email, password, role} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

  
    // TODO: Validate the request body

    const newUser = await User.create({ //User to be included from models
        id: users.length + 1,
        name,
        email,
        password,
        role,
    });

    users.push(newUser);
    res.status(201).json({ id: newUser.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /users/login
router.post('/login', (req, res) => {
  // TODO: Implement logic to authenticate a User
  // - Validate the request body (email and password)
  // - Check if the provided email and password match a User in the database
  // - If authenticated, generate and return a JWT token with a 200 status code
  // - Return appropriate error responses if needed
});

// GET /users/{id}
router.get('/:id', (req, res) => {
  // TODO: Implement logic to fetch data about a specific User
  // - Check if the authenticated User's ID matches the requested User's ID
  // - If authorized, fetch the User data from the database
  // - If the User has 'instructor' role, include the list of taught Course IDs
  // - If the User has 'student' role, include the list of enrolled Course IDs
  // - Return the User data with a 200 status code
  // - Return appropriate error responses if needed
});


export default router;