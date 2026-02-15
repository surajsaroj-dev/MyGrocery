const Advertisement = require('../models/Advertisement');

// @desc    Get all active advertisements
// @route   GET /api/advertisements
// @access  Public
const getActiveAds = async (req, res) => {
    try {
        const now = new Date();
        const ads = await Advertisement.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).sort({ createdAt: -1 });

        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all advertisements (Admin)
// @route   GET /api/advertisements/all
// @access  Private/Admin
const getAllAds = async (req, res) => {
    try {
        const ads = await Advertisement.find({})
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create advertisement
// @route   POST /api/advertisements
// @access  Private/Admin
const createAd = async (req, res) => {
    const { title, description, image, link, position, startDate, endDate } = req.body;

    try {
        const ad = await Advertisement.create({
            title,
            description,
            image,
            link,
            position,
            startDate,
            endDate,
            createdBy: req.user._id
        });

        res.status(201).json(ad);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update advertisement
// @route   PUT /api/advertisements/:id
// @access  Private/Admin
const updateAd = async (req, res) => {
    try {
        const ad = await Advertisement.findById(req.params.id);

        if (!ad) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        const updatedAd = await Advertisement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedAd);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private/Admin
const deleteAd = async (req, res) => {
    try {
        const ad = await Advertisement.findById(req.params.id);

        if (!ad) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        await Advertisement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Advertisement deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getActiveAds,
    getAllAds,
    createAd,
    updateAd,
    deleteAd
};
