<script setup lang="ts">
useHead({
  title: 'How ratings work — Kitsu Season Trends',
  link: [{ rel: 'canonical', href: 'https://kitsu.wopian.me/ratings/' }],
})
useSeoMeta({
  description: 'How Kitsu user ratings become weighted votes, Laplace and Wilson scores, and seasonal history charts.',
})

const weights = [
  ['8.5–10', '1', '0'],
  ['6.5–8', '0.75', '0.25'],
  ['4.5–6', '0.5', '0.5'],
  ['2.5–4', '0.25', '0.75'],
  ['0.5–2', '0', '1'],
]
</script>
<template>
  <div class="site-shell">
    <SiteHeader />
    <main class="ratings-page">
      <NuxtLink to="/" class="back-link">← Back to seasons</NuxtLink>
      <h1>How ratings work</h1>
      <p class="ratings-intro">
        Scores combine Kitsu user ratings with weighted votes and an adjustment
        for small samples. These scores differ from Kitsu’s average rating.
      </p>

      <section aria-labelledby="weighted-votes">
        <h2 id="weighted-votes">From ratings to votes</h2>
        <p>
          Each rating contributes one vote, split between upvotes and downvotes.
          Ratings use five bands. This weighting explains fractional vote counts.
        </p>
        <table>
          <caption>Vote weights per Kitsu rating</caption>
          <thead>
            <tr><th scope="col">Rating / 10</th><th scope="col">Upvotes</th><th scope="col">Downvotes</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in weights" :key="row[0]">
              <th scope="row">{{ row[0] }}</th><td>{{ row[1] }}</td><td>{{ row[2] }}</td>
            </tr>
          </tbody>
        </table>
        <p>
          Users Rated counts submitted ratings. Favourites counts Kitsu users
          who mark an anime as a favourite. Both show raw counts.
        </p>
      </section>

      <section aria-labelledby="rating-formulas">
        <h2 id="rating-formulas">Laplace and Wilson scores</h2>
        <h3>Laplace</h3>
        <p>Laplace scores add five to total votes before calculating a percentage.</p>
        <p class="rating-formula"><code>100 × upvotes / (upvotes + downvotes + 5)</code></p>
        <p>
          For example, 75 upvotes and 25 downvotes produce 71.43%.
          More votes reduce the effect of this adjustment.
        </p>
        <h3>Wilson</h3>
        <p>
          Older archives use the lower bound of the Wilson confidence interval
          with z = 1.96. This accounts for uncertainty when few ratings exist.
        </p>
        <p>
          Season dashboards use their archived scoring method. Full history uses
          Laplace where recorded, otherwise Wilson. Historical scores stay unchanged.
        </p>
      </section>

      <section aria-labelledby="reading-charts">
        <h2 id="reading-charts">Reading charts and rankings</h2>
        <ul>
          <li>Rating uses a 0–100% axis. Users Rated, Upvotes, Downvotes and Favourites share a separate count axis.</li>
          <li>Graph toggles work independently from sorting. Rankings use each anime’s latest recorded value, then anime ID for ties.</li>
          <li>Rating changes use percentage points: 70% to 72% is +2 pp. Count changes compare the previous recorded sample.</li>
          <li>Season overview shows average ratings for new anime and leftovers separately. Zero scores are excluded from these averages.</li>
          <li>Full history includes all archived seasons for an anime. Histories with more than 90 observations show each metric’s highest value per ISO week, Monday–Sunday UTC. Shorter histories show daily samples.</li>
          <li>Weekly peaks can come from different observations. The 30/90-day views show daily samples. Gaps mark missing days or weeks.</li>
        </ul>
        <p>Data updates daily. Downloads retain original observations, including values omitted from weekly charts.</p>
      </section>
      <NuxtLink to="/" class="back-link">Back to seasons</NuxtLink>
    </main>
  </div>
</template>
