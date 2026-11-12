// 0025: e-mail de redefinição de senha aponta para a página do próprio app (/redefinir-senha),
// e não para o painel do PocketBase. {APP_URL} é a URL do aplicativo configurada no backend
// (Settings > Application URL) e precisa ser a origem pública do app.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.resetPasswordTemplate = {
      subject: 'Redefinir sua senha · Pacioli',
      body: `<p>Olá,</p>
<p>Recebemos um pedido para redefinir a senha do seu acesso ao Pacioli.</p>
<p>
  <a class="btn" href="{APP_URL}/redefinir-senha?token={TOKEN}" target="_blank" rel="noopener">Redefinir senha</a>
</p>
<p>Se o botão não funcionar, copie e cole este endereço no navegador:<br/>{APP_URL}/redefinir-senha?token={TOKEN}</p>
<p><i>Se você não pediu a redefinição, ignore este e-mail. Sua senha atual continua valendo.</i></p>
<p>Equipe Pacioli</p>`,
    }
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.resetPasswordTemplate = {
      subject: 'Reset your {APP_NAME} password',
      body: `<p>Hello,</p>
<p>Click on the button below to reset your password.</p>
<p>
  <a class="btn" href="{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}" target="_blank" rel="noopener">Reset password</a>
</p>
<p><i>If you didn't ask to reset your password, please ignore this email.</i></p>
<p>
  Thanks,<br/>
  {APP_NAME} team
</p>`,
    }
    app.save(users)
  },
)
