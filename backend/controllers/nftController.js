const NFT = require('../models/NFT');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const axios = require('axios');
const mongoose = require('mongoose');

exports.getUserNFTs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { collection, status } = req.query;

    let filterQuery = { userId };
    
    if (collection && collection !== 'All Collections') {
      filterQuery.collectionName = new RegExp(`^${collection}$`, 'i');
    }
    if (status) {
      filterQuery.status = status;
    }

    const nfts = await NFT.find(filterQuery);

    if (nfts.length === 0 && !collection && !status) {
      const fallbackNFTs = [
        { name: 'Cosmic Serpent', collectionName: 'Neon Vipers', badge: 'RARE #042', badgeClass: 'cyan', label: 'FLOOR PRICE', price: '4.20 ETH', imageUrl: 'fallback_or_imported_asset_path', status: 'On Sale' },
        { name: 'Void Ripples', collectionName: 'Ether Spirits', badge: 'EPIC #881', badgeClass: 'pink', label: 'CURRENT BID', price: '12.50 ETH', imageUrl: 'fallback_or_imported_asset_path', status: 'Auction' },
        { name: 'Oracle Vision', collectionName: 'Void Walkers', badge: 'MYTHIC #001', badgeClass: 'purple', label: 'FLOOR PRICE', price: '25.00 ETH', imageUrl: 'fallback_or_imported_asset_path', status: 'On Sale' }
      ];
      return res.status(200).json({ success: true, nfts: fallbackNFTs });
    }

    res.status(200).json({ success: true, nfts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.mintNFT = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, collectionName, badge, badgeClass, price, description, imageUrl } = req.body;

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Wallet not found.' });
    }

    const newNFT = new NFT({
      userId,
      ownerAddress: wallet.address || wallet.publicAddress,
      name,
      collectionName,
      badge,
      badgeClass,
      price,
      description,
      imageUrl,
      status: 'Hidden',
      label: 'MINT PRICE'
    });

    await newNFT.save();

    // Log to python blockchain
    let txHash = new mongoose.Types.ObjectId().toString();
    try {
      await axios.post('http://localhost:5001/transactions/new', {
        sender: '0x0000000000000000000000000000000000000000',
        recipient: wallet.address || wallet.publicAddress,
        amount: 0 // NFTs are non-fungible, passing 0 amount for the blockchain logger
      });
      const mineResponse = await axios.get('http://localhost:5001/mine');
      txHash = mineResponse.data.pow_hash || mineResponse.data.previous_hash;
    } catch (e) {
      console.log('Blockchain logging failed, using local hash.', e.message);
    }

    // Log to global Transaction DB
    await Transaction.create({
      txHash,
      senderAddress: '0x0000000000000000000000000000000000000000',
      receiverAddress: wallet.address || wallet.publicAddress,
      amount: 0,
      tokenSymbol: 'NFT',
      feeAmount: 0,
      feeToken: 'ETH',
      transactionType: 'RECEIVE',
      status: 'SUCCESS',
      userId,
      metadata: { memo: `Minted NFT: ${name}`, sourcePage: 'NFT' }
    });

    res.status(201).json({ success: true, message: 'NFT successfully minted!', nft: newNFT });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.transferNFT = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nftId, receiverAddress } = req.body;

    const nft = await NFT.findOne({ _id: nftId, userId });
    if (!nft) {
      return res.status(404).json({ success: false, message: 'NFT not found or not owned by you.' });
    }

    const senderWallet = await Wallet.findOne({ userId });
    const receiverWallet = await Wallet.findOne({ $or: [{ address: receiverAddress }, { publicAddress: receiverAddress }] });
    
    if (!receiverWallet) {
      return res.status(404).json({ success: false, message: 'Receiver wallet not found on this platform.' });
    }

    // Transfer ownership
    nft.userId = receiverWallet.userId;
    nft.ownerAddress = receiverWallet.address || receiverWallet.publicAddress;
    nft.status = 'Hidden';
    await nft.save();

    // Log to python blockchain
    let txHash = new mongoose.Types.ObjectId().toString();
    try {
      await axios.post('http://localhost:5001/transactions/new', {
        sender: senderWallet.address || senderWallet.publicAddress,
        recipient: receiverWallet.address || receiverWallet.publicAddress,
        amount: 0
      });
      const mineResponse = await axios.get('http://localhost:5001/mine');
      txHash = mineResponse.data.pow_hash || mineResponse.data.previous_hash;
    } catch (e) {
      console.log('Blockchain logging failed, using local hash.', e.message);
    }

    // Log to global Transaction DB
    await Transaction.create({
      txHash,
      senderAddress: senderWallet.address || senderWallet.publicAddress,
      receiverAddress: receiverWallet.address || receiverWallet.publicAddress,
      amount: 0,
      tokenSymbol: 'NFT',
      feeAmount: 0,
      feeToken: 'ETH',
      transactionType: 'SEND',
      status: 'SUCCESS',
      userId,
      metadata: { memo: `Transferred NFT: ${nft.name}`, sourcePage: 'NFT' }
    });

    res.status(200).json({ success: true, message: 'NFT successfully transferred.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateNFTStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { status, price } = req.body;

    const nft = await NFT.findOne({ _id: id, userId });
    if (!nft) {
      return res.status(404).json({ success: false, message: 'NFT not found or not owned by you.' });
    }

    if (status) nft.status = status;
    if (price) nft.price = price;

    if (status === 'Auction') nft.label = 'CURRENT BID';
    else if (status === 'On Sale') nft.label = 'FLOOR PRICE';

    await nft.save();

    res.status(200).json({ success: true, message: 'NFT listing updated.', nft });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNFTDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const nft = await NFT.findById(id);
    if (!nft) {
      return res.status(404).json({ success: false, message: 'NFT not found.' });
    }
    res.status(200).json({ success: true, nft });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};