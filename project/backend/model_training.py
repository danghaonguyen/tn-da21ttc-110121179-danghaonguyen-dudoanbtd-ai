from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_curve,
    auc,
    precision_score,
    recall_score,
    f1_score,
)
from imblearn.over_sampling import SMOTE
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import joblib
import os


def train_model(df):
    # 1. Đặt nhãn và đặc trưng
    X = df.drop("diabetic", axis=1)
    y = df["diabetic"]

    # 2. Chia dữ liệu train/test (stratify đảm bảo tỷ lệ lớp giữ nguyên ở train/test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 3. Kiểm tra và báo cáo phân bổ lớp
    print("\n📊 Tỷ lệ toàn bộ dữ liệu:")
    print(y.value_counts())
    print(y.value_counts(normalize=True).apply(lambda x: f"{x:.2%}"))

    print("\n📊 Tỷ lệ tập Train (trước SMOTE):")
    print(y_train.value_counts())
    print(y_train.value_counts(normalize=True).apply(lambda x: f"{x:.2%}"))

    print("\n📊 Tỷ lệ tập Test:")
    print(y_test.value_counts())
    print(y_test.value_counts(normalize=True).apply(lambda x: f"{x:.2%}"))

    # 4. SMOTE cân bằng lớp trên tập train (không bao giờ trên test)
    print("\n🔁 Áp dụng SMOTE trên tập Train...")
    smote = SMOTE(random_state=42)
    X_train_balanced, y_train_balanced = smote.fit_resample(
        X_train.astype("float64"), y_train.astype(int)
    )

    print("\n📊 Tỷ lệ tập Train sau SMOTE (đã cân bằng):")
    print(pd.Series(y_train_balanced).value_counts())
    print(
        pd.Series(y_train_balanced)
        .value_counts(normalize=True)
        .apply(lambda x: f"{x:.2%}")
    )

    # 5. Chuẩn hóa dữ liệu
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_balanced)
    X_test_scaled = scaler.transform(X_test)

    # 6. Huấn luyện Logistic Regression (có class_weight để tăng nhạy cảm với lớp thiểu số)
    model = LogisticRegression(max_iter=5000, class_weight="balanced")
    model.fit(X_train_scaled, y_train_balanced)

    # 7. Đánh giá trên tập Test gốc (giữ nguyên)
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]

    print("\n🎯 Accuracy:", accuracy_score(y_test, y_pred))
    print("\n📋 Classification Report:\n", classification_report(y_test, y_pred))

    # Biểu đồ Confusion Matrix trước khi cân bằng
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(5, 4))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False)
    plt.title("Confusion Matrix (Test Set)")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.show()

    # Biểu đồ Confusion Matrix của tập Train sau khi cân bằng
    y_train_pred = model.predict(X_train_scaled)
    cm_train = confusion_matrix(y_train_balanced, y_train_pred)
    plt.figure(figsize=(5, 4))
    sns.heatmap(cm_train, annot=True, fmt="d", cmap="Greens", cbar=False)
    plt.title("Confusion Matrix (Train Set - Sau SMOTE)")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.show()

    # ROC Curve & AUC
    fpr, tpr, thresholds = roc_curve(y_test, y_prob)
    roc_auc = auc(fpr, tpr)

    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, label=f"ROC Curve (AUC = {roc_auc:.2f})", lw=2)
    plt.plot([0, 1], [0, 1], "k--")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("Receiver Operating Characteristic (ROC) Curve")
    plt.legend(loc="lower right")
    plt.grid(True)
    plt.show()

    # 8. Lưu mô hình và scaler
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/trained_model.pkl")
    joblib.dump(scaler, "models/scaler.pkl")
    print("\n✅ Mô hình đã được lưu tại models/trained_model.pkl")
    print("✅ Bộ chuẩn hóa đã được lưu tại models/scaler.pkl")

    return model


def threshold_tuning_report(y_true, y_prob):
    thresholds = [i / 100 for i in range(10, 91, 5)]
    report = []

    for th in thresholds:
        y_pred = (y_prob >= th).astype(int)
        precision = precision_score(y_true, y_pred, zero_division=0)
        recall = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        acc = accuracy_score(y_true, y_pred)
        report.append({
            "Threshold": th,
            "Precision": round(precision, 2),
            "Recall": round(recall, 2),
            "F1-Score": round(f1, 2),
            "Accuracy": round(acc, 2)
        })

    df_report = pd.DataFrame(report)
    print("\n📊 Bảng so sánh các threshold:")
    print(df_report)

    # Gợi ý threshold tốt nhất theo F1
    best_row = df_report.loc[df_report["F1-Score"].idxmax()]
    print(f"\n💡 Gợi ý Threshold tốt nhất theo F1-score: {best_row['Threshold']} "
          f"(Precision: {best_row['Precision']}, Recall: {best_row['Recall']}, F1: {best_row['F1-Score']})")


    
