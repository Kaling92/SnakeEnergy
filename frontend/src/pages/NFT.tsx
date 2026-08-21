// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import PageLayout from '../components/PageLayout';
import styles from '../assets/NFT.module.css';
import { useLanguage } from '../context/LanguageContext';

const classes = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (styles as Record<string, string>)[name] ?? name)
    .join(' ');

// Import all 6 unique NFT images
import nftCosmicSerpent from '../assets/nft_cosmic_serpent.png';
import nftVenomStrike from '../assets/nft_venom_strike.png';
import nftVoidRipples from '../assets/nft_void_ripples.png';
import nftPhantomEcho from '../assets/nft_phantom_echo.png';
import nftOracleVision from '../assets/nft_oracle_vision.png';
import nftAbyssalGate from '../assets/nft_abyssal_gate.png';

const localImageMap: Record<string, string> = {
  'Cosmic Serpent': nftCosmicSerpent,
  'Venom Strike': nftVenomStrike,
  'Void Ripples': nftVoidRipples,
  'Phantom Echo': nftPhantomEcho,
  'Oracle Vision': nftOracleVision,
  'Abyssal Gate': nftAbyssalGate
};

// Fallback image for minted NFTs without a known name
const fallbackImage = nftCosmicSerpent;

const NFT = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [nfts, setNfts] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('All Collections');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Modal states
  const [showMintModal, setShowMintModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showListingModal, setShowListingModal] = useState(false);
  
  const [selectedNFT, setSelectedNFT] = useState<any>(null);

  // Mint Form State
  const [mintForm, setMintForm] = useState({
    name: '', collectionName: 'Neon Vipers', badge: 'RARE', badgeClass: 'cyan', price: '0 ETH', description: '', imageUrl: ''
  });
  // Transfer Form State
  const [transferAddress, setTransferAddress] = useState('');
  // Listing Form State
  const [listingForm, setListingForm] = useState({ status: 'On Sale', price: '' });

  const handleDemoAction = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 2500);
  };

  const fallbackNfts = [
    { name: 'Cosmic Serpent', collectionName: 'Neon Vipers', badge: 'RARE #042', badgeClass: 'cyan', label: 'FLOOR PRICE', price: '4.20 ETH', status: 'On Sale', description: 'A cosmic serpent coiled around a neon crystal in deep space. Forged in the kinetic energy of the blockchain.' },
    { name: 'Venom Strike', collectionName: 'Neon Vipers', badge: 'UNCOMMON #117', badgeClass: 'green', label: 'FLOOR PRICE', price: '1.50 ETH', status: 'On Sale', description: 'A venomous cyber-viper striking through digital circuits. Raw power channeled through the matrix.' },
    { name: 'Void Ripples', collectionName: 'Ether Spirits', badge: 'EPIC #881', badgeClass: 'pink', label: 'CURRENT BID', price: '12.50 ETH', status: 'Auction', description: 'Ethereal energy waves expanding through the void. Each ripple carries the whisper of lost data.' },
    { name: 'Phantom Echo', collectionName: 'Ether Spirits', badge: 'RARE #305', badgeClass: 'cyan', label: 'FLOOR PRICE', price: '3.00 ETH', status: 'Hidden', description: 'A translucent serpent spirit phasing through digital portals. Between dimensions, it echoes forever.' },
    { name: 'Oracle Vision', collectionName: 'Void Walkers', badge: 'MYTHIC #001', badgeClass: 'purple', label: 'FLOOR PRICE', price: '25.00 ETH', status: 'On Sale', description: 'The all-seeing oracle eye with serpent scales. It perceives every transaction across all chains.' },
    { name: 'Abyssal Gate', collectionName: 'Void Walkers', badge: 'EPIC #666', badgeClass: 'pink', label: 'CURRENT BID', price: '8.75 ETH', status: 'Auction', description: 'A dark dimensional gateway opening in the void. Only void walkers dare to cross its threshold.' }
  ];

  const collectionLore: Record<string, { title: string, desc: string }> = {
    'All Collections': { title: language === 'VI' ? 'Kho NFT Của Bạn' : 'Your NFT Vault', desc: language === 'VI' ? 'Quản lý bộ sưu tập kỹ thuật số của bạn trong không gian đa chiều.' : 'Curate and manage your high-fidelity digital collectibles in a kinetic multi-dimensional space.' },
    'Neon Vipers': { title: 'Neon Vipers', desc: language === 'VI' ? 'Tổ chức rắn-máy thống trị thế giới ngầm kỹ thuật số.' : 'A venomous syndicate of cyber-reptilians ruling the digital underground.' },
    'Ether Spirits': { title: 'Ether Spirits', desc: language === 'VI' ? 'Các thực thể huyền bí được rèn trong thế giới sau cái chết của blockchain.' : 'Ethereal entities forged in the digital afterlife of the blockchain.' },
    'Void Walkers': { title: 'Void Walkers', desc: language === 'VI' ? 'Những nhà du hành xuyên chiều không gian khám phá vùng sâu của metaverse.' : 'Interdimensional travelers mapping the unknown depths of the metaverse.' }
  };

  const fetchVaultNFTs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/Login');
        return;
      }

      let url = `/api/nfts?collection=${selectedCollection}`;
      if (selectedStatus) {
        url += `&status=${selectedStatus}`;
      }

      const res = await apiClient.get(url);

      if (res.data.success) {
        setNfts(res.data.nfts);
      }
    } catch (err) {
      console.error("Error reading blockchain NFT metadata structures:", err);
      setError(language === 'VI' ? 'Nguồn NFT không khả dụng. Hiển thị thẻ vault đã lưu.' : 'NFT feed unavailable. Showing cached vault cards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultNFTs();
  }, [selectedCollection, selectedStatus, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMintForm({ ...mintForm, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const submitMint = async () => {
    if (!mintForm.name || !mintForm.imageUrl) return alert("Please provide a name and upload an image.");
    try {
      const res = await apiClient.post('/api/nfts/mint', mintForm);
      if (res.data.success) {
        alert("NFT Minted Successfully!");
        setShowMintModal(false);
        fetchVaultNFTs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to mint NFT.");
    }
  };

  const submitTransfer = async () => {
    if (!transferAddress) return alert("Please provide a receiver address.");
    try {
      const res = await apiClient.post('/api/nfts/transfer', { nftId: selectedNFT._id, receiverAddress: transferAddress });
      if (res.data.success) {
        alert("NFT Transferred Successfully!");
        setShowTransferModal(false);
        setShowDetailsModal(false);
        fetchVaultNFTs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to transfer NFT.");
    }
  };

  const submitListing = async () => {
    if (!listingForm.price) return alert("Please provide a price.");
    try {
      const res = await apiClient.put(`/api/nfts/${selectedNFT._id}/status`, listingForm);
      if (res.data.success) {
        alert("Listing Updated!");
        setShowListingModal(false);
        setShowDetailsModal(false);
        fetchVaultNFTs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to update listing.");
    }
  };

  const openDetails = (nft: any) => {
    setSelectedNFT(nft);
    setShowDetailsModal(true);
  };

  const getImage = (nft: any) => {
    if (nft.imageUrl?.startsWith('data:') || nft.imageUrl?.startsWith('http')) return nft.imageUrl;
    return localImageMap[nft.name] || fallbackImage;
  };

  const showFallback = !loading && nfts.length === 0;
  
  let visibleNfts = showFallback ? fallbackNfts : nfts;
  if (showFallback && selectedCollection !== 'All Collections') {
    visibleNfts = visibleNfts.filter(n => n.collectionName === selectedCollection);
  }
  if (showFallback && selectedStatus) {
    visibleNfts = visibleNfts.filter(n => n.status === selectedStatus);
  }

  const currentLore = collectionLore[selectedCollection] || collectionLore['All Collections'];

  const badgeLabel = (badgeClass: string) => {
    const map: Record<string, string> = { cyan: 'badgeCyan', pink: 'badgePink', purple: 'badgePurple', green: 'badgeGreen', gray: 'badgeGray' };
    return map[badgeClass] || 'badgeCyan';
  };

  return (
    <PageLayout currentPage="menuNFT">
      <div className={classes("nftPage")}>
        {error && (
          <div style={{ marginBottom: 12, padding: '10px 12px', border: '1px solid rgba(255, 184, 77, 0.45)', background: 'rgba(255, 184, 77, 0.08)', color: '#ffd08a', borderRadius: 10, fontSize: 13 }}>
            {error}
          </div>
        )}
        <div className={classes("nftHeader")}>
          <div className={classes("headerLeft")}>
            <p className={classes("tag")}>{language === 'VI' ? 'HỆ SINH THÁI KỸ THUẬT SỐ' : 'DIGITAL ECOSYSTEM'}</p>
            <h1>{currentLore.title}</h1>
            <p className={classes("desc")}>{currentLore.desc}</p>
          </div>
          <div className={classes("headerRight")}>
            <div className={classes("toggle")}>
              <button className={classes("active")}>Grid</button>
              <button onClick={() => handleDemoAction(language === 'VI' ? 'Chế độ danh sách chưa khả dụng.' : 'List view not yet available.')}>List</button>
            </div>
            <button className={classes("mintBtn")} onClick={() => setShowMintModal(true)}>+ {language === 'VI' ? 'Đúc Mới' : 'Mint New'}</button>
            {actionMessage && <span style={{ position: 'absolute', top: 80, right: 20, background: '#1c1c28', color: '#ffb84d', padding: '8px 12px', borderRadius: 8, fontSize: 12, border: '1px solid #3d3d66' }}>{actionMessage}</span>}
          </div>
        </div>
        
        <div className={classes("nftContent")}>
          <div className={classes("sidebar")}>
            <p className={classes("sectionTitle")}>{language === 'VI' ? 'BỘ SƯU TẬP' : 'COLLECTIONS'}</p>
            {['All Collections', 'Neon Vipers', 'Ether Spirits', 'Void Walkers'].map((col) => (
              <div 
                className={`${classes("collection")} ${selectedCollection === col ? classes("collectionActive") : ''}`} 
                key={col}
                onClick={() => setSelectedCollection(col)}
                style={{ cursor: 'pointer' }}
              >
                {col === 'All Collections' ? (language === 'VI' ? 'Tất Cả' : 'All Collections') : col}
              </div>
            ))}

            <p className={classes("sectionTitle")}>{language === 'VI' ? 'TRẠNG THÁI' : 'STATUS'}</p>
            <div className={classes("statusBox")}>
              {['On Sale', 'Auction', 'Bidded', 'Hidden'].map((status) => (
                <button 
                  key={status}
                  className={selectedStatus === status ? classes("activeStatus") : ''}
                  onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className={classes("storage")}>
              <p className={classes("storageLabel")}>{language === 'VI' ? 'LƯU TRỮ' : 'STORAGE'}</p>
              <h3>{language === 'VI' ? 'Tối Ưu IPFS' : 'IPFS Optimization'}</h3>
              <p>{language === 'VI' ? 'Tài sản được bảo mật trên lưới kinetic.' : 'Your assets are secured across the kinetic grid.'}</p>
              <div className={classes("bar")}><div className={classes("fill")} style={{ width: '78%' }} /></div>
            </div>
          </div>

          <div className={classes("grid")} id="nftGrid">
            {loading ? (
              <div style={{ color: 'cyan', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>{language === 'VI' ? 'Đang đồng bộ Vault...' : 'Syncing Ledger Vault...'}</div>
            ) : visibleNfts.length === 0 ? (
              <div style={{ color: '#666', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>{language === 'VI' ? 'Không tìm thấy mục nào.' : 'No items found matching criteria.'}</div>
            ) : (
              visibleNfts.map((card, idx) => (
                <div className={classes("card")} key={card._id || idx} onClick={() => openDetails(card)} style={{ cursor: 'pointer' }}>
                  <div className={classes("imgWrap")}>
                    <img src={getImage(card)} alt={card.name} />
                    <span className={classes(badgeLabel(card.badgeClass))}>{card.badge}</span>
                  </div>
                  <div className={classes("cardBody")}>
                    <p className={classes("name")}>{card.name}</p>
                    <p className={classes("sub")}>{card.collectionName}</p>
                    <div className={classes("priceRow")}>
                      <div>
                        <p className={classes("label")}>{card.label}</p>
                        <p className={classes("priceValue")}>{card.price}</p>
                      </div>
                      <div className={classes("statusIndicator")} data-status={card.status}>
                        {card.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            <div className={classes("empty")} onClick={() => handleDemoAction(language === 'VI' ? 'Chức năng nhập đang bị vô hiệu hóa.' : 'Importing collections is disabled.')} style={{ cursor: 'pointer' }}>
              <div className={classes("plus")}>+</div>
              <p>{language === 'VI' ? 'NHẬP BỘ SƯU TẬP' : 'IMPORT COLLECTION'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MINT MODAL */}
      {showMintModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1c1c28', padding: 30, borderRadius: 16, width: 400, border: '1px solid #3d3d66' }}>
            <h2 style={{ marginTop: 0, color: '#fff' }}>{language === 'VI' ? 'Đúc NFT Mới' : 'Mint New NFT'}</h2>
            <input placeholder="NFT Name" style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 8, background: '#12121a', border: '1px solid #3d3d66', color: '#fff' }} value={mintForm.name} onChange={e => setMintForm({...mintForm, name: e.target.value})} />
            <input placeholder="Description" style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 8, background: '#12121a', border: '1px solid #3d3d66', color: '#fff' }} value={mintForm.description} onChange={e => setMintForm({...mintForm, description: e.target.value})} />
            <select style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 8, background: '#12121a', border: '1px solid #3d3d66', color: '#fff' }} value={mintForm.collectionName} onChange={e => setMintForm({...mintForm, collectionName: e.target.value})}>
              <option value="Neon Vipers">Neon Vipers</option>
              <option value="Ether Spirits">Ether Spirits</option>
              <option value="Void Walkers">Void Walkers</option>
            </select>
            <div style={{ marginBottom: 10, color: '#999', fontSize: 14 }}>
              Upload Image:
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'block', marginTop: 5 }} />
            </div>
            {mintForm.imageUrl && <img src={mintForm.imageUrl} style={{ width: '100%', borderRadius: 8, marginBottom: 10, maxHeight: 200, objectFit: 'cover' }} />}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button style={{ flex: 1, padding: 10, background: '#00e0ff', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }} onClick={submitMint}>{language === 'VI' ? 'Đúc NFT' : 'Mint NFT'}</button>
              <button style={{ flex: 1, padding: 10, background: 'transparent', color: '#fff', border: '1px solid #3d3d66', borderRadius: 8, cursor: 'pointer' }} onClick={() => setShowMintModal(false)}>{language === 'VI' ? 'Hủy' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetailsModal && selectedNFT && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1c1c28', padding: 30, borderRadius: 16, width: 450, border: '1px solid #3d3d66', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ marginTop: 0, color: '#fff' }}>{selectedNFT.name}</h2>
              <button style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', fontSize: 20 }} onClick={() => setShowDetailsModal(false)}>&times;</button>
            </div>
            <img src={getImage(selectedNFT)} style={{ width: '100%', borderRadius: 12, marginBottom: 15 }} />
            <p style={{ color: '#00e0ff', margin: '0 0 10px 0', fontWeight: 'bold' }}>{selectedNFT.collectionName} — {selectedNFT.badge}</p>
            <p style={{ color: '#aaa', margin: '0 0 20px 0', fontSize: 14 }}>{selectedNFT.description || 'No description available for this asset.'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#12121a', padding: 15, borderRadius: 8, marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, color: '#666', fontSize: 12 }}>{language === 'VI' ? 'Trạng thái' : 'Status'}</p>
                <p style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>{selectedNFT.status}</p>
              </div>
              <div>
                <p style={{ margin: 0, color: '#666', fontSize: 12 }}>{language === 'VI' ? 'Giá' : 'Price'}</p>
                <p style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>{selectedNFT.price}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 10, background: '#00e0ff', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setShowTransferModal(true)}>{language === 'VI' ? 'Chuyển' : 'Transfer'}</button>
              <button style={{ flex: 1, padding: 10, background: '#3d3d66', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }} onClick={() => { setListingForm({ status: selectedNFT.status, price: selectedNFT.price.replace(' ETH', '') }); setShowListingModal(true); }}>{language === 'VI' ? 'Cập Nhật' : 'Update Listing'}</button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1c1c28', padding: 30, borderRadius: 16, width: 400, border: '1px solid #3d3d66' }}>
            <h3 style={{ marginTop: 0, color: '#fff' }}>{language === 'VI' ? 'Chuyển' : 'Transfer'} {selectedNFT?.name}</h3>
            <p style={{ color: '#aaa', fontSize: 14, marginBottom: 20 }}>{language === 'VI' ? 'Nhập địa chỉ ví người nhận để chuyển quyền sở hữu vĩnh viễn.' : "Enter the recipient's wallet address to permanently transfer ownership of this asset."}</p>
            <input placeholder="0x..." style={{ width: '100%', padding: 10, marginBottom: 20, borderRadius: 8, background: '#12121a', border: '1px solid #3d3d66', color: '#fff' }} value={transferAddress} onChange={e => setTransferAddress(e.target.value)} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 10, background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }} onClick={submitTransfer}>{language === 'VI' ? 'Xác Nhận' : 'Confirm Transfer'}</button>
              <button style={{ flex: 1, padding: 10, background: 'transparent', color: '#fff', border: '1px solid #3d3d66', borderRadius: 8, cursor: 'pointer' }} onClick={() => setShowTransferModal(false)}>{language === 'VI' ? 'Hủy' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      {/* LISTING MODAL */}
      {showListingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1c1c28', padding: 30, borderRadius: 16, width: 400, border: '1px solid #3d3d66' }}>
            <h3 style={{ marginTop: 0, color: '#fff' }}>{language === 'VI' ? 'Cập Nhật Niêm Yết' : 'Update Listing'}</h3>
            <select style={{ width: '100%', padding: 10, marginBottom: 10, borderRadius: 8, background: '#12121a', border: '1px solid #3d3d66', color: '#fff' }} value={listingForm.status} onChange={e => setListingForm({...listingForm, status: e.target.value})}>
              <option value="On Sale">On Sale</option>
              <option value="Auction">Auction</option>
              <option value="Hidden">Hidden</option>
            </select>
            <input placeholder="Price (e.g. 5.50 ETH)" style={{ width: '100%', padding: 10, marginBottom: 20, borderRadius: 8, background: '#12121a', border: '1px solid #3d3d66', color: '#fff' }} value={listingForm.price} onChange={e => setListingForm({...listingForm, price: e.target.value})} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ flex: 1, padding: 10, background: '#00e0ff', color: '#000', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }} onClick={submitListing}>{language === 'VI' ? 'Cập Nhật' : 'Update'}</button>
              <button style={{ flex: 1, padding: 10, background: 'transparent', color: '#fff', border: '1px solid #3d3d66', borderRadius: 8, cursor: 'pointer' }} onClick={() => setShowListingModal(false)}>{language === 'VI' ? 'Hủy' : 'Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default NFT;