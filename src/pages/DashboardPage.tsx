import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import ListingCard from '@/components/ListingCard';
import ListingModal from '@/components/ListingModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Plus, LogOut, Package, Search, LayoutGrid, List } from 'lucide-react';
import type { Listing, ListingFormData } from '@/types';
import styles from './DashboardPage.module.css';
import clsx from 'clsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { listings, loading, error, createListing, updateListing, deleteListing } = useListings(user ? user.id : null);

  const [showModal, setShowModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingModal, setSavingModal] = useState(false);
  const [deletingModal, setDeletingModal] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/login');
  };

  const handleOpenCreate = () => {
    setEditingListing(null);
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (listing: Listing) => {
    setEditingListing(listing);
    setModalError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingListing(null);
    setModalError(null);
  };

  const handleSave = async (formData: ListingFormData) => {
    setSavingModal(true);
    setModalError(null);
    let err: string | null = null;
    if (editingListing) {
      err = await updateListing(editingListing.id, formData);
    } else {
      err = await createListing(formData);
    }
    setSavingModal(false);
    if (err) {
      setModalError(err);
    } else {
      handleCloseModal();
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeletingModal(true);
    await deleteListing(deletingId);
    setDeletingModal(false);
    setDeletingId(null);
  };

  const filteredListings = listings.filter(l => {
    const matchesSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const deletingListing = deletingId ? listings.find(l => l.id === deletingId) : null;

  const activeCount = listings.filter(l => l.status === 'active').length;
  const inactiveCount = listings.filter(l => l.status === 'inactive').length;

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <div className={styles.navBrand}>
          <span className={styles.navIcon}>⚡</span>
          <span className={styles.navName}>ListingHub</span>
        </div>
        <div className={styles.navRight}>
          <span className={styles.navEmail}>{user?.email}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>My Listings</h1>
            <p className={styles.pageSubtitle}>Manage your product listings</p>
          </div>
          <button className={styles.createBtn} onClick={handleOpenCreate}>
            <Plus size={17} />
            New Listing
          </button>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{listings.length}</span>
            <span className={styles.statLabel}>Total Listings</span>
          </div>
          <div className={styles.statCard}>
            <span className={clsx(styles.statValue, styles.statActive)}>{activeCount}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statCard}>
            <span className={clsx(styles.statValue, styles.statInactive)}>{inactiveCount}</span>
            <span className={styles.statLabel}>Inactive</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search listings..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className={styles.viewToggle}>
              <button
                className={clsx(styles.viewBtn, viewMode === 'grid' && styles.viewBtnActive)}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                className={clsx(styles.viewBtn, viewMode === 'list' && styles.viewBtnActive)}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner}>{error}</div>
        )}

        {/* Content */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredListings.length === 0 ? (
          <div className={styles.empty}>
            <Package size={48} strokeWidth={1.2} />
            <p className={styles.emptyTitle}>
              {listings.length === 0 ? 'No listings yet' : 'No results found'}
            </p>
            <p className={styles.emptySubtitle}>
              {listings.length === 0
                ? 'Create your first listing to get started.'
                : 'Try adjusting your search or filter.'}
            </p>
            {listings.length === 0 && (
              <button className={styles.createBtn} onClick={handleOpenCreate}>
                <Plus size={16} />
                Create Listing
              </button>
            )}
          </div>
        ) : (
          <div className={clsx(styles.grid, viewMode === 'list' && styles.listView)}>
            {filteredListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteClick}
                deleting={deletingModal && deletingId === listing.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <ListingModal
          listing={editingListing}
          onClose={handleCloseModal}
          onSave={handleSave}
          saving={savingModal}
        />
      )}

      {deletingId && deletingListing && (
        <DeleteConfirmModal
          listingName={deletingListing.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingId(null)}
          deleting={deletingModal}
        />
      )}

      {/* Modal-level error */}
      {modalError && (
        <div className={styles.toastError}>
          {modalError}
        </div>
      )}
    </div>
  );
}
