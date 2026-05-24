import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminHelpPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-heading font-bold mb-8">
          Инструкция по управлению сайтом
        </h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-heading text-accent-bright mb-3">
              Статьи блога
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Все статьи находятся в разделе «Статьи». Вы можете редактировать
              любую статью — изменить заголовок, текст, категорию, дату. После
              сохранения изменения появятся на сайте через 2-3 минуты. Для
              создания новой статьи обратитесь к разработчику.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading text-accent-bright mb-3">
              Направления
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              В разделе «Направления» можно редактировать информацию о странах и
              регионах: описание, сезон, бюджет, сложность, FAQ. Изменения
              сохраняются автоматически и появляются на сайте через пару минут.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading text-accent-bright mb-3">
              Изображения
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              В разделе «Медиафайлы» можно загружать новые изображения и
              копировать их URL для вставки в статьи. После загрузки изображение
              оптимизируется автоматически. Поддерживаются форматы JPG, PNG,
              WebP.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading text-accent-bright mb-3">
              Безопасность
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Админка защищена паролем. После 10 минут бездействия происходит
              автоматический выход. Не сообщайте пароль третьим лицам. Для смены
              пароля обратитесь к разработчику.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-heading text-accent-bright mb-3">
              Техническая поддержка
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              При возникновении вопросов или проблем свяжитесь с разработчиком.
              Контакты указаны на странице{" "}
              <a href="/contact" className="text-accent-bright hover:underline">
                Контакты
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
