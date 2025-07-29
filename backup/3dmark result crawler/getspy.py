import json
import requests
import os

def get_gpu_mapping():
    """
    从gpumap.json文件中获取GPU名称到ID的映射
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    gpu_list_file = os.path.join(current_dir, 'gpumap.json')
    if not os.path.exists(gpu_list_file):
        return {}

    with open(gpu_list_file, 'r', encoding='utf-8') as f:
        return json.load(f)

gpu_mapping = get_gpu_mapping()

def get_timespy_score(gpu_id):
    """
    根据GPU ID获取Time Spy图形分数
    """
    url = f"https://www.3dmark.com/proxycon/ajax/medianscore?test=spy%20P&gpuId={gpu_id}&country&scoreType=graphicsScore"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Connection': 'keep-alive',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7'
    }
    if not gpu_id:
        return None
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()

        return int(data.get('median'))
    except Exception as e:
        print(f"获取分数失败 GPU ID {gpu_id}: {e}")
        return None
    
def save_scores_to_file(scores):
    """
    将分数保存到scores.json文件中
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    scores_file = os.path.join(current_dir, 'scores.json')
    
    with open(scores_file, 'w', encoding='utf-8') as f:
        json.dump(scores, f, indent=4, ensure_ascii=False)
    
def main():
    gpu_mapping = get_gpu_mapping()
    scores = {}
    for gpu_name, gpu_id in gpu_mapping.items():
        score = get_timespy_score(gpu_id)
        if score is not None:
            scores[gpu_name] = score
            print(f"GPU: {gpu_name}, Score: {score}")
    save_scores_to_file(scores)
    print("所有GPU分数已保存到scores.json文件中。")

if __name__ == "__main__":
    main()