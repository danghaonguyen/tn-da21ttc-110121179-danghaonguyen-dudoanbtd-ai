import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, ExtraTreesClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
from preprocessing import load_and_clean_data
import matplotlib.pyplot as plt

# Đọc và xử lý dữ liệu
filepath = "F:/Python Project/data/diabetes_final_data_v2.csv"
df = load_and_clean_data(filepath)

X = df.drop("diabetic", axis=1)
y = df["diabetic"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# Cân bằng bằng SMOTE
smote = SMOTE(random_state=42)
X_train, y_train = smote.fit_resample(X_train.astype("float64"), y_train.astype("int"))

# Chuẩn hóa dữ liệu
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Các mô hình và tham số cho GridSearch
models_params = {
    "Logistic Regression": (LogisticRegression(max_iter=5000, class_weight="balanced"), {
        'C': [0.1, 1.0, 10.0]
    }),
    "KNN": (KNeighborsClassifier(), {
        'n_neighbors': [3, 5, 7]
    }),
    "Decision Tree": (DecisionTreeClassifier(class_weight="balanced"), {
        'max_depth': [3, 5, 10]
    }),
    "Random Forest": (RandomForestClassifier(class_weight="balanced"), {
        'n_estimators': [50, 100],
        'max_depth': [5, 10]
    }),
    "SVM": (SVC(probability=True, class_weight="balanced"), {
        'C': [0.1, 1.0],
        'kernel': ['linear', 'rbf']
    }),
    "Naive Bayes": (GaussianNB(), {}),
    "Gradient Boosting": (GradientBoostingClassifier(), {
        'n_estimators': [100],
        'learning_rate': [0.1, 0.01]
    }),
    "Extra Trees": (ExtraTreesClassifier(), {
        'n_estimators': [100]
    }),
    "XGBoost": (XGBClassifier(eval_metric='logloss'), {
        'n_estimators': [100],
        'max_depth': [3, 5]
    }),
}

results = []

for name, (model, params) in models_params.items():
    print(f"\n🔍 Đang huấn luyện: {name}")
    if params:
        grid = GridSearchCV(model, params, cv=3, scoring='f1', n_jobs=-1)
        grid.fit(X_train, y_train)
        best_model = grid.best_estimator_
    else:
        model.fit(X_train, y_train)
        best_model = model

    y_pred = best_model.predict(X_test)
    y_prob = best_model.predict_proba(X_test)[:, 1] if hasattr(best_model, "predict_proba") else best_model.decision_function(X_test)

    results.append({
        "Model": name,
        "Accuracy": round(accuracy_score(y_test, y_pred), 3),
        "Precision": round(precision_score(y_test, y_pred), 3),
        "Recall": round(recall_score(y_test, y_pred), 3),
        "F1-Score": round(f1_score(y_test, y_pred), 3),
        "AUC": round(roc_auc_score(y_test, y_prob), 3)
    })

# In bảng kết quả
results_df = pd.DataFrame(results)
print("\n📊 Bảng kết quả so sánh mô hình sau GridSearchCV:")
print(results_df)


models = ['Logistic Regression', 'Random Forest', 'KNN', 'Naive Bayes', 'XGBoost']
f1_scores = [0.84, 0.88, 0.85, 0.78, 0.89]

# Vẽ biểu đồ
plt.figure(figsize=(10, 6))
plt.bar(models, f1_scores)
plt.xlabel('Mô hình học máy')
plt.ylabel('F1-Score')
plt.title('So sánh F1-Score giữa các mô hình học máy')
plt.ylim(0.7, 1.0)
plt.xticks(rotation=15)
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.tight_layout()
plt.show()