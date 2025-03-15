// Contact book owner
router.post('/contact-owner', authenticateToken, async (req, res) => {
    try {
        const { bookId, message } = req.body;
        const interestedUser = req.user; // From auth middleware

        // Get book details
        const book = await Book.findById(bookId).populate('owner');
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Get owner details
        const owner = book.owner;
        if (!owner) {
            return res.status(404).json({ message: 'Book owner not found' });
        }

        // Prepare email data
        const emailData = {
            ownerName: owner.name,
            bookName: book.title,
            bookType: book.type,
            bookPrice: book.price,
            bookCover: book.coverImage,
            location: book.location,
            interestedUserName: interestedUser.name,
            interestedUserEmail: interestedUser.email,
            interestedUserPhone: interestedUser.phone || null,
            message: message
        };

        // Send email using your email service
        await sendEmail({
            to: owner.email,
            subject: `Someone is interested in your book: ${book.title}`,
            template: 'book_interest',
            data: emailData
        });

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending contact message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
}); 