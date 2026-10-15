import { useEffect, useState } from 'react';
import {
  fetchTodayChallenge,
  fetchChallengeHistory,
  completeChallenge,
} from '../api/challengeApi';

function ChallengesPage() {
  const [challenge, setChallenge] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');

  const loadChallenges = async () => {
    try {
      setLoading(true);
      setError('');

      const [todayResult, historyResult] = await Promise.all([
        fetchTodayChallenge(),
        fetchChallengeHistory(),
      ]);

      setChallenge(todayResult.challenge);
      setHistory(historyResult.challenges || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load sustainability challenges.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleComplete = async () => {
    if (!challenge || completing) return;

    try {
      setCompleting(true);
      setError('');

      const result = await completeChallenge(challenge._id);

      setChallenge(result.challenge);

      const historyResult = await fetchChallengeHistory();
      setHistory(historyResult.challenges || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to complete the challenge.'
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem' }}>
        Loading today’s challenge...
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>{error}</p>

        <button onClick={loadChallenges}>
          Try Again
        </button>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div style={{ padding: '2rem' }}>
        No challenge available today.
      </div>
    );
  }

  const completed = challenge.status === 'COMPLETED';

  return (
    <main
      style={{
        padding: '2rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <h1>Today's Sustainability Challenge</h1>

      {/* Today's Challenge */}
      <section
        style={{
          marginTop: '1.5rem',
          padding: '2rem',
          borderRadius: '16px',
          border: '1px solid #ddd',
        }}
      >
        <p>
          <strong>{challenge.category}</strong>
        </p>

        <h2>{challenge.title}</h2>

        <p>{challenge.description}</p>

        <div style={{ marginTop: '1rem' }}>
          <strong>{challenge.points} EcoPoints</strong>
          {' · '}
          {challenge.difficulty}
          {' · '}
          {challenge.duration} min
        </div>

        <p style={{ marginTop: '1rem' }}>
          Estimated CO₂ reduction:{' '}
          {challenge.estimatedCO2Reduction} kg CO₂e
        </p>

        {error && (
          <p style={{ marginTop: '1rem' }}>
            {error}
          </p>
        )}

        {completed ? (
          <div style={{ marginTop: '1.5rem' }}>
            <strong>✓ Challenge completed</strong>

            <p>
              You earned {challenge.points} EcoPoints.
            </p>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{ marginTop: '1.5rem' }}
          >
            {completing
              ? 'Completing...'
              : 'Mark as Complete'}
          </button>
        )}
      </section>

      {/* Challenge History */}
      <section style={{ marginTop: '2.5rem' }}>
        <h2>Challenge History</h2>

        {history.length === 0 ? (
          <p>No previous challenges yet.</p>
        ) : (
          <div style={{ marginTop: '1rem' }}>
            {history.map((item) => (
              <article
                key={item._id}
                style={{
                  padding: '1.25rem',
                  marginBottom: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #ddd',
                }}
              >
                <strong>{item.title}</strong>

                <p style={{ margin: '0.5rem 0' }}>
                  {item.category}
                  {' · '}
                  {item.points} EcoPoints
                  {' · '}
                  {item.difficulty}
                </p>

                <p style={{ margin: 0 }}>
                  Date:{' '}
                  {new Date(item.date).toLocaleDateString()}
                </p>

                <p style={{ margin: '0.5rem 0 0' }}>
                  Status:{' '}
                  <strong>{item.status}</strong>
                </p>

                {item.completedAt && (
                  <p style={{ margin: '0.5rem 0 0' }}>
                    Completed:{' '}
                    {new Date(
                      item.completedAt
                    ).toLocaleString()}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ChallengesPage;