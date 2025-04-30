export const getInviteEmailHtml = (code: string, signupLink: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 8px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <img src="https://via.placeholder.com/120x40?text=UnityCRM" alt="UnityCRM" width="120" />
    </div>
    <h2 style="color: #333;">Добро пожаловать в UnityCRM!</h2>
    <p style="color: #555;">Вас пригласили в систему управления клиентами. Ваш инвайт-код:</p>
    <div style="font-size: 24px; font-weight: bold; margin: 16px 0; background: #f3f3f3; padding: 12px 24px; border-radius: 6px; text-align: center;">
      ${code}
    </div>
    <p>Чтобы зарегистрироваться, нажмите на кнопку ниже:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${signupLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Зарегистрироваться
      </a>
    </div>
    <p style="font-size: 12px; color: #888;">
      Если вы не запрашивали это письмо, просто проигнорируйте его.
    </p>
  </div>
`;
