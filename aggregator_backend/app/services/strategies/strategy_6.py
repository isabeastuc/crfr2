from typing import Dict, Any

STRATEGY_NAME = 'auto_strategy_6'

def build_position(amount: float) -> Dict[str, Any]:
    if amount <= 0:
        return {'ok': False, 'reason': 'amount must be positive'}
    return {'ok': True, 'capital': amount, 'strategy': STRATEGY_NAME}

from typing import Dict, Any

STRATEGY_NAME = 'auto_strategy_6'

def build_position(amount: float) -> Dict[str, Any]:
    if amount <= 0:
        return {'ok': False, 'reason': 'amount must be positive'}
    return {'ok': True, 'capital': amount, 'strategy': STRATEGY_NAME}
