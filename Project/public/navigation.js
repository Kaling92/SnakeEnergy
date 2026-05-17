document.addEventListener('DOMContentLoaded', () => {
  const menuRoutes = {
    menuDashboard: 'Homepage.html',
    menuAssets: 'Assets.html',
    menuSwap: 'Swap.html',
    menuAnalytics: 'Anlytics.html',
    menuNFT: 'NFT.html',
    menuTransactions: 'Transactions.html',
    menuNotifications: 'Notifications.html',
    menuSecurity: 'Security.html',
    menuSettings: 'Settings.html'
  };

  const currentPage = window.location.pathname.split('/').pop() || 'Homepage.html';

  document.querySelectorAll('.menuItem').forEach((item) => {
    if (menuRoutes[item.id] === currentPage) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }

    item.addEventListener('click', () => {
      const target = menuRoutes[item.id];
      if (target) {
        window.location.href = target;
      }
    });
  });

  // Bell icon navigation
  document.querySelectorAll('.bell').forEach(bell => {
    bell.addEventListener('click', () => {
      window.location.href = 'Notifications.html';
    });
  });

  // Wallet icon navigation
  document.querySelectorAll('.wallet').forEach(wallet => {
    wallet.addEventListener('click', () => {
      window.location.href = 'Wallet.html';
    });
  });

  const receiveButton = document.getElementById('receive');
  const sendButton = document.getElementById('send');
  const allAssetsLink = document.getElementById('allAssests');

  if (receiveButton) {
    receiveButton.addEventListener('click', () => {
      window.location.href = 'Receive.html';
    });
  }

  if (sendButton) {
    sendButton.addEventListener('click', () => {
      window.location.href = 'Send.html';
    });
  }

  if (allAssetsLink) {
    allAssetsLink.addEventListener('click', () => {
      window.location.href = 'Assets.html';
    });
  }

  const exploreVaultBtn = document.getElementById('exploreVaultBtn');
  if (exploreVaultBtn) {
    exploreVaultBtn.addEventListener('click', () => {
      window.location.href = 'ExploreVaults.html';
    });
  }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'Login.html';
    });
  }
});
