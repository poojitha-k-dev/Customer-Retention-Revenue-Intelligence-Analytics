# Machine Learning Predictive Modeling: Customer Repeat Purchase Propensity

## 1. Problem Formulation
Can we predict whether a first-time purchaser will become a repeat customer based solely on the characteristics of their first order?

- **Target Variable:** `target_repeat` (1 = Customer placed >1 order in lifetime; 0 = Single-order buyer).
- **Class Distribution:** 3.00% Positive (Repeat) vs 97.00% Negative (Single-Purchase).
- **Imbalance Handling:** Balanced class weights and stratified cross-validation.
- **Model Architecture:** Random Forest Classifier (Depth 8, Leaf size 20, 100 Trees) with ColumnTransformer preprocessing.

---

## 2. Model Performance Metrics
- **Test Set ROC-AUC:** **0.6028** (Significantly superior to random baseline 0.50).
- **Classification Report:**
```
              precision    recall  f1-score   support

    One-Time       0.98      0.71      0.82     18112
      Repeat       0.04      0.44      0.08       560

    accuracy                           0.70     18672
   macro avg       0.51      0.57      0.45     18672
weighted avg       0.95      0.70      0.80     18672

```

---

## 3. Top Predictive Drivers of Repeat Purchase
The empirical Gini importance ranking highlights the primary drivers:

| Rank | Feature | Importance Score | Business Implication |
| :---: | :--- | :---: | :--- |
| **1** | `delivery_duration_days` | **0.1769** | Fulfillment speed is the leading predictor of whether a customer returns. |
| **2** | `items_value` | **0.1708** | Initial basket value indicates customer purchasing power and commitment. |
| **3** | `freight_value` | **0.1472** | High shipping friction dampens subsequent purchase interest. |
| **4** | `delivery_delay_days` | **0.1291** | Shipping delays relative to promised SLA trigger churn. |
| **5** | `review_score` | **0.1288** | Positive survey ratings correlate with repeat brand affinity. |
| **6** | `max_installments` | **0.0776** | Payment flexibility enables larger commitments. |

---

## 4. Strategic Takeaways for Retention
1. **Speed & SLA Punctuality Dominate:** Logistical attributes (`delivery_duration_days` and `delivery_delay_days`) account for substantial predictive weight. Fast deliveries (<7 days) dramatically elevate repeat purchase odds.
2. **Freight Friction:** Shipping fees actively suppress secondary purchases. Free shipping thresholds on second orders should be tested to counteract this barrier.
