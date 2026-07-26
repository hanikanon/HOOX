# إصلاح استقبال المكالمات والتطبيق مقفول — دليل التركيب

## شنو تغيّر

أضفنا موديول Android نيتف حقيقي (Kotlin) بشكل Capacitor plugin محلي اسمه
`capacitor-incoming-call`، موجود الحين داخل مجلد المشروع مباشرة. هذا يحل
المشكلة الجذرية: قبل كذا، كل منطق المكالمة (PeerJS) كان يشتغل فقط داخل
JavaScript اللي يعمل وقت التطبيق مفتوح — فما كان فيه أي شيء يستقبل
المكالمة أو حتى يظهر شاشة استقبال حقيقية والتطبيق مقفول.

الحين:

1. **`IncomingCallNotificationServiceExtension`** — يعترض إشعار OneSignal
   *قبل* ما يُعرض، حتى والتطبيق مقفول تمامًا (نظام Android يشغّل هذا الكود
   تلقائيًا عشان يفعّل هذا الامتداد، بدون ما يحتاج يفتح تطبيقك). لو النوع
   `incoming_call`، يوقف إشعار OneSignal الافتراضي ويبني إشعار خاص فينا.
2. **إشعار حقيقي بفئة "مكالمة" (`CATEGORY_CALL` + `Full-Screen Intent`)** —
   هذا يخلي الشاشة تفتح تلقائيًا فوق شاشة القفل (زي واتساب بالضبط)، مو بس
   إشعار عادي بالأعلى.
3. **`IncomingCallActivity`** — شاشة استقبال نيتف كاملة (Answer/Decline)،
   تظهر فورًا حتى لو الـ JS/WebView ما خلص تحميل بعد، وبنفس الوقت تشغّل
   التطبيق بالخلفية عشان اتصال PeerJS يبلش يتصل مباشرة (بدل ما ننتظر لين
   يضغط المستخدم "Answer").
4. **زر Answer/Decline على الإشعار نفسه** يشتغلون فعليًا الحين (عبر
   `CallActionReceiver`) — مو بس يفتحون التطبيق.
5. ربط جافاسكربت (`use-call.tsx`) يسمع لهذا الحدث ويكمل نفس مسار
   `answerCall()` / `declineCall()` الموجود مسبقًا.

## وين تحط الملفات

الملف المضغوط اللي بعثته يحتوي المشروع كامل بعد التعديل. فك الضغط ودزّه
(git push) بدل المشروع الحالي — البنية صارت:

```
repo-root/
├── package.json          (فيه dependency جديدة: capacitor-incoming-call)
├── src/hooks/use-call.tsx  (معدّل)
├── src/lib/onesignal.ts    (تعليق توضيحي بس، بدون تغيير وظيفي)
├── .gitignore               (معدّل — عشان ملفات الـ plugin ما تنستثنى)
└── capacitor-incoming-call/ (مجلد جديد كامل — هذا هو الإصلاح الفعلي)
    ├── package.json
    ├── dist/index.js, index.d.ts
    └── android/
        ├── build.gradle
        └── src/main/
            ├── AndroidManifest.xml
            ├── res/values/styles.xml
            └── java/com/cryptvora/incomingcall/*.kt
```

## خطوات التركيب

1. **ثبّت الحزم من جديد** (عشان يربط الـ local plugin):
   ```bash
   bun install   # أو npm install
   ```
2. ما فيه أي تغيير مطلوب على `.github/workflows/build-android.yml` —
   Capacitor يكتشف الـ plugin تلقائيًا وقت `npx cap sync android` لأنه
   مسجل بحقل `"capacitor"` بملف `package.json` حقه.
3. ابنِ زي العادة (push على main، أو شغّل الـ workflow يدويًا). لو صار
   خطأ Gradle متعلق بنسخة OneSignal SDK، افتح
   `capacitor-incoming-call/android/build.gradle` وعدّل السطر:
   ```gradle
   onesignalVersion = ... '[5.1.0, 5.99.99]'
   ```
   ليطابق نسخة `@onesignal/capacitor-plugin` الفعلية عندك.

## ليش كان الخطأ "All included players are not subscribed" يطلع

هذا معناه إن OneSignal ما لقى أي اشتراك (push subscription) نشط تحت
`external_id` حق الجهاز وقت الإرسال — يعني `OneSignal.login()` إما ما
خلص/ما زامن بعد، أو صلاحية الإشعارات مرفوضة، أو الاشتراك انقطع. هذا شائع
جدًا على أجهزة MIUI/Xiaomi (زي الجهاز بالصور) اللي تقيّد التطبيقات
بالخلفية بقوة. **بعد التركيب، تأكد من:**

- صلاحية الإشعارات ممنوحة يدويًا لتطبيق Hoox
- على أجهزة Xiaomi: فعّل "Autostart" لتطبيق Hoox + عطّل "Battery saver"
  له تحديدًا (Settings → Apps → Hoox → Battery saver → No restrictions)
- على أندرويد 14+: تأكد إن صلاحية "Full screen notifications" مفعّلة
  للتطبيق (Settings → Apps → Hoox → Notifications → Full screen
  notifications) — أحيانًا ما تُمنح تلقائيًا على بعض الأجهزة

## حدود ما زالت موجودة (مو محلولة 100%)

- لو ضغط المستقبل "Decline" مباشرة من الإشعار بدون ما يفتح التطبيق أبدًا،
  المتصل ما يعرف بهذا فورًا (بس ينتظر انتهاء مهلة الـ 45 ثانية) — لأن قناة
  الإشارة (control channel) بين الجهازين ما تكون موجودة أصلًا لو التطبيق
  ما فتح ولا مرة. حل هذا يحتاج سيرفر إشارات خاص فيك (مو بس OneSignal)
  لاحقًا لو تبي تجعلها فورية.
- مفتاح `VITE_ONESIGNAL_REST_API_KEY` لسا مضمّن داخل الـ APK نفسه (أي شخص
  يفكّه يقدر يرسل إشعارات وهمية عبر مشروع OneSignal حقك) — مقبول لعدد
  قليل من المستخدمين المتعارفين، بس قبل ما توصل لملايين المستخدمين لازم
  تنقل إرسال الإشعار لسيرفر خلفي تتحكم فيه أنت، مو من جوا التطبيق مباشرة.
