// Create web server
// By: Fco. Javier Gutierrez
// Date: 11/01/2020
// Description: Web server for comments

// Imports
const express = require('express');
const router = express.Router();git add comments.js
const { check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const auth = require('../../middleware/auth');

// Import models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   POST api/comment/:id
// @desc    Create a comment
// @access  Private
router.post(
  '/:id',
  [
    auth,
    [
      check('text', 'Text is required').not().isEmpty(),
      check('name', 'Name is required').not().isEmpty(),
      check('avatar', 'Avatar is required').not().isEmpty(),
      check('user', 'User is required').not().isEmpty(),
      check('post', 'Post is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If errors return 400 status
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Get user
      const user = await User.findById(req.user.id).select('-password');
      // Get post
      const post = await Post.findById(req.params.id);

      // Create new comment
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: user.id,
        post: post.id,
      };

      // Add comment to post
      post.comments.unshift(newComment);

      // Save post
      await post.save();

      // Return post
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/comment/:id/:comment_id
// @desc    Update a comment
// @access  Private
router.put(
  '/:id/:comment_id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    // Check validation errors
    const errors