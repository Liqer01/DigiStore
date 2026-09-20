module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '1005294511743-8q0snj3dggul6ktjd03votrrvdvg79g5.apps.googleusercontent.com',
    discordClientId: process.env.DISCORD_CLIENT_ID || '1545837295041511485',
    githubClientId: process.env.GITHUB_CLIENT_ID || '',
    smtpConfigured: true,
    domain: 'closydev.site'
  });
};
