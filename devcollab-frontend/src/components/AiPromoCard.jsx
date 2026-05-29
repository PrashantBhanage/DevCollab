function AiPromoCard({ workspaces, onOpenAi }) {
  const hasWorkspaces = workspaces.length > 0;
  const latestWorkspace = hasWorkspaces ? workspaces[0] : null;

  const handleOpen = () => {
    if (latestWorkspace) {
      onOpenAi(latestWorkspace.id);
    }
  };

  return (
    <div className="ai-promo-card">
      <h3>AI Assistant</h3>
      <p>Code review, debugging, and architecture help — right inside your workspace.</p>
      <button
        type="button"
        className="btn btn-primary btn-full"
        onClick={handleOpen}
        disabled={!hasWorkspaces}
      >
        Open AI Assistant
      </button>
      {!hasWorkspaces && (
        <p className="ai-promo-hint">Create a workspace first to use AI.</p>
      )}
    </div>
  );
}

export default AiPromoCard;
