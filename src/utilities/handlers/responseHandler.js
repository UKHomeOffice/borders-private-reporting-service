const healthRes = (err, data, res) => {
    if (err) {
        return res.status(err.code).json(err.message);
    }
    return res.status(200).json(data);
};

export default {
    healthRes
};
